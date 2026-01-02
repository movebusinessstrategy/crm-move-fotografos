import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Database, Key } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1>Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure alertas e lembretes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sistema de notificações por email para lembretes automáticos de follow-ups, aniversários e prazos.
            </p>
            <Button variant="outline">Configurar Notificações</Button>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Integração WhatsApp</CardTitle>
                <CardDescription>API do WhatsApp Business</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua conta do WhatsApp Business para importar contatos automaticamente.
            </p>
            <Button variant="outline">Configurar WhatsApp</Button>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Backup de Dados</CardTitle>
                <CardDescription>Exportar e importar dados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Faça backup dos seus dados ou importe informações de outros sistemas.
            </p>
            <Button variant="outline">Gerenciar Backup</Button>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Personalização</CardTitle>
                <CardDescription>Customize o Kanban e fluxos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Personalize as etapas do Kanban de acordo com o seu processo de vendas.
            </p>
            <Button variant="outline">Personalizar Fluxos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
