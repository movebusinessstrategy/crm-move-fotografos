import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Appointments() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    scheduledAt: "",
    scheduledTime: "",
    type: "other" as "follow_up" | "session" | "delivery" | "birthday" | "other",
  });

  const utils = trpc.useUtils();
  const { data: appointments, isLoading } = trpc.appointments.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  
  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      utils.appointments.list.invalidate();
      utils.appointments.upcoming.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Agendamento criado com sucesso!");
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      utils.appointments.list.invalidate();
      utils.appointments.upcoming.invalidate();
      toast.success("Agendamento atualizado!");
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      title: "",
      description: "",
      scheduledAt: "",
      scheduledTime: "",
      type: "other",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledDateTime = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`);
    
    createMutation.mutate({
      clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
      title: formData.title,
      description: formData.description || undefined,
      scheduledAt: scheduledDateTime,
      type: formData.type,
    });
  };

  const handleComplete = (appointmentId: number) => {
    updateMutation.mutate({
      id: appointmentId,
      completed: true,
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      follow_up: "Follow-up",
      session: "Sessão",
      delivery: "Entrega",
      birthday: "Aniversário",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const sortedAppointments = appointments?.sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Agendamentos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus compromissos e lembretes
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Agendamento</DialogTitle>
              <DialogDescription>
                Adicione um novo compromisso
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Data *</Label>
                  <Input
                    id="scheduledAt"
                    type="date"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Hora *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="session">Sessão</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar Agendamento"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      ) : sortedAppointments && sortedAppointments.length > 0 ? (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className={`shadow-elegant ${appointment.completed ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {appointment.completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {appointment.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.scheduledAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                          {getTypeLabel(appointment.type)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  {!appointment.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(appointment.id)}
                      disabled={updateMutation.isPending}
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </CardHeader>
              {appointment.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{appointment.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-elegant">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum agendamento cadastrado</p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Agendamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
