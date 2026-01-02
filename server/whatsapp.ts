import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import fs from "fs";

const AUTH_PATH = path.join(process.cwd(), "whatsapp_auth");

export class WhatsAppService {
  private sock: any = null;
  private qr: string | null = null;
  private connectionStatus: "connecting" | "connected" | "disconnected" = "disconnected";

  constructor() {
    if (!fs.existsSync(AUTH_PATH)) {
      fs.mkdirSync(AUTH_PATH, { recursive: true });
    }
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
      },
      logger: pino({ level: "silent" }),
    });

    this.sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qr = qr;
      }

      if (connection === "close") {
        this.connectionStatus = "disconnected";
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("WhatsApp connection closed. Reconnecting:", shouldReconnect);
        if (shouldReconnect) {
          this.start();
        }
      } else if (connection === "open") {
        this.connectionStatus = "connected";
        this.qr = null;
        console.log("WhatsApp connection opened!");
      }
    });

    this.sock.ev.on("creds.update", saveCreds);

    // Listen for messages to sync contacts/leads
    this.sock.ev.on("messages.upsert", async (m: any) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe) {
            const remoteJid = msg.key.remoteJid;
            const pushName = msg.pushName || "Contato WhatsApp";
            console.log(`New message from ${pushName} (${remoteJid})`);
            // Here we can implement auto-lead creation
          }
        }
      }
    });
  }

  getQR() {
    return this.qr;
  }

  getStatus() {
    return this.connectionStatus;
  }

  async logout() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.qr = null;
      this.connectionStatus = "disconnected";
      if (fs.existsSync(AUTH_PATH)) {
        fs.rmSync(AUTH_PATH, { recursive: true, force: true });
      }
    }
  }
}

export const whatsapp = new WhatsAppService();
