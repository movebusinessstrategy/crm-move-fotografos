import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, MessageSquare, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppIntegration() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("disconnected");

  const getStatusQuery = trpc.whatsapp.getStatus.useQuery(undefined, {
    refetchInterval: status === "connected" ? 30000 : 5000,
  });

  const startMutation = trpc.whatsapp.start.useMutation({
    onSuccess: () => {
      toast.success("Iniciando conexão com WhatsApp...");
      getStatusQuery.refetch();
    },
  });

  const logoutMutation = trpc.whatsapp.logout.useMutation({
    onSuccess: () => {
      toast.success("Desconectado com sucesso");
      getStatusQuery.refetch();
    },
  });

  useEffect(() => {
    if (getStatusQuery.data) {
      setStatus(getStatusQuery.data.status);
      setQrCode(getStatusQuery.data.qr);
    }
  }, [getStatusQuery.data]);

  const handleConnect = () => {
    startMutation.mutate();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-green-500" />
          Integração WhatsApp
        </h1>

        <Card className="shadow-elegant border-gold/20">
          <CardHeader>
            <CardTitle>Conectar WhatsApp Business</CardTitle>
            <CardDescription>
              Conecte seu WhatsApp para importar contatos e gerenciar leads automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            {status === "connected" ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/10 p-6 rounded-full inline-block">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-green-500">WhatsApp Conectado!</h2>
                <p className="text-muted-foreground">
                  Seu CRM está sincronizado com o WhatsApp.
                </p>
                <Button variant="destructive" onClick={handleLogout} className="mt-4">
                  Desconectar Conta
                </Button>
              </div>
            ) : status === "connecting" || qrCode ? (
              <div className="text-center space-y-6">
                {qrCode ? (
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                    <QRCodeSVG value={qrCode} size={256} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p>Gerando QR Code...</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="font-medium">Escaneie o QR Code acima</p>
                  <p className="text-sm text-muted-foreground">
                    Abra o WhatsApp no seu celular {">"} Aparelhos Conectados {">"} Conectar um aparelho
                  </p>
                </div>
                <Button variant="outline" onClick={() => getStatusQuery.refetch()} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Atualizar
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="bg-muted p-6 rounded-full inline-block">
                  <MessageSquare className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-medium">Pronto para conectar?</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Ao conectar, o CRM poderá ler seus contatos para facilitar o cadastro de novos leads.
                  </p>
                </div>
                <Button onClick={handleConnect} size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                  Gerar QR Code de Conexão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Importação Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Novas conversas podem ser transformadas em leads com um clique.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Sincronização de Nome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                O CRM puxa o nome do perfil do cliente automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
