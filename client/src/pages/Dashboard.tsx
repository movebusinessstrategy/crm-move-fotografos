import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

export default function Dashboard() {
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: upcomingAppointments } = trpc.appointments.upcoming.useQuery();
  const { data: stats } = trpc.analytics.getDealStats.useQuery({});

  const totalClients = clients?.length || 0;
  const totalDeals = deals?.length || 0;
  const upcomingCount = upcomingAppointments?.length || 0;
  
  const totalRevenue = deals
    ?.filter(d => d.status === "fechada")
    .reduce((sum, d) => sum + (parseFloat(d.negotiatedValue || "0")), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu negócio fotográfico
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negociações Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.opportunities || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vendas fechadas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nos próximos dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
            <CardDescription>Performance de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vendas Fechadas</span>
                <span className="text-2xl font-bold text-green-600">{stats?.won || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vendas Perdidas</span>
                <span className="text-2xl font-bold text-red-600">{stats?.lost || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conversão</span>
                <span className="text-2xl font-bold text-primary">
                  {stats?.conversionRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Seus compromissos</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <Calendar className="h-4 w-4 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{appointment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.scheduledAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
