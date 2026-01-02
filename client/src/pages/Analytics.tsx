import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

export default function Analytics() {
  const { data: stats } = trpc.analytics.getDealStats.useQuery({});
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();

  const totalRevenue = deals
    ?.filter(d => d.status === "fechada")
    .reduce((sum, d) => sum + (parseFloat(d.negotiatedValue || "0")), 0) || 0;

  const lostRevenue = deals
    ?.filter(d => d.status === "perdida")
    .reduce((sum, d) => sum + (parseFloat(d.negotiatedValue || "0")), 0) || 0;

  const opportunityRevenue = deals
    ?.filter(d => d.status === "oportunidade")
    .reduce((sum, d) => sum + (parseFloat(d.negotiatedValue || "0")), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1>Análise de Dados</h1>
        <p className="text-muted-foreground mt-2">
          Métricas e insights do seu negócio
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.conversionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.won || 0} vendas fechadas de {stats?.total || 0} negociações
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Fechada</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.won || 0} vendas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Perdida</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {lostRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.lost || 0} vendas perdidas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Oportunidade</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              R$ {opportunityRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.opportunities || 0} negociações ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Resumo de Vendas</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-600"></div>
                  <span className="font-medium">Vendas Fechadas</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats?.won || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span className="font-medium">Oportunidades</span>
                </div>
                <span className="text-2xl font-bold text-primary">{stats?.opportunities || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-600"></div>
                  <span className="font-medium">Vendas Perdidas</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats?.lost || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Estatísticas gerais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-medium">Total de Clientes</span>
                <span className="text-2xl font-bold">{clients?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-medium">Total de Negociações</span>
                <span className="text-2xl font-bold">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Ticket Médio</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {stats?.won ? (totalRevenue / stats.won).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
