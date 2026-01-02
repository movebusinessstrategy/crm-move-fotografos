import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, DollarSign, Settings, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Deal = {
  id: number;
  title: string;
  negotiatedValue: string | null;
  currentStageId: number | null;
  clientId: number;
  productId: number | null;
  status: string;
};

function DraggableDealCard({ deal, onStatusChange }: { deal: Deal; onStatusChange: (dealId: number, status: "fechada" | "perdida") => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-all cursor-move" {...attributes} {...listeners}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm flex-1">{deal.title}</CardTitle>
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {deal.negotiatedValue && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <DollarSign className="h-4 w-4" />
              R$ {parseFloat(deal.negotiatedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(deal.id, "fechada");
              }}
            >
              Fechada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(deal.id, "perdida");
              }}
            >
              Perdida
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Kanban() {
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [manageStagesOpen, setManageStagesOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<{ id: number; name: string; color: string } | null>(null);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#6B7280");
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: "",
    productId: "",
    title: "",
    negotiatedValue: "",
    expectedCloseDate: "",
    currentStageId: "",
    notes: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const utils = trpc.useUtils();
  const { data: stages } = trpc.kanban.listStages.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();

  const initStagesMutation = trpc.kanban.initializeDefaultStages.useMutation({
    onSuccess: () => {
      utils.kanban.listStages.invalidate();
      toast.success("Etapas padrão criadas!");
    },
  });

  const createStageMutation = trpc.kanban.createStage.useMutation({
    onSuccess: () => {
      utils.kanban.listStages.invalidate();
      setNewStageName("");
      setNewStageColor("#6B7280");
      toast.success("Etapa criada com sucesso!");
    },
  });

  const updateStageMutation = trpc.kanban.updateStage.useMutation({
    onSuccess: () => {
      utils.kanban.listStages.invalidate();
      setEditingStage(null);
      toast.success("Etapa atualizada!");
    },
  });

  const deleteStageMutation = trpc.kanban.deleteStage.useMutation({
    onSuccess: () => {
      utils.kanban.listStages.invalidate();
      toast.success("Etapa removida!");
    },
  });

  const createDealMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      setNewDealOpen(false);
      resetForm();
      toast.success("Negociação criada com sucesso!");
    },
  });

  const updateDealStageMutation = trpc.deals.moveToStage.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      toast.success("Negociação movida!");
    },
  });

  const updateStatusMutation = trpc.deals.updateStatus.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      toast.success("Status atualizado!");
    },
  });

  useEffect(() => {
    if (stages && stages.length === 0) {
      initStagesMutation.mutate();
    }
  }, [stages]);

  const resetForm = () => {
    setFormData({
      clientId: "",
      productId: "",
      title: "",
      negotiatedValue: "",
      expectedCloseDate: "",
      currentStageId: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createDealMutation.mutate({
      clientId: parseInt(formData.clientId),
      productId: formData.productId ? parseInt(formData.productId) : undefined,
      title: formData.title,
      negotiatedValue: formData.negotiatedValue || undefined,
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      currentStageId: formData.currentStageId ? parseInt(formData.currentStageId) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleStatusChange = (dealId: number, status: "fechada" | "perdida") => {
    updateStatusMutation.mutate({ id: dealId, status });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDealId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDealId(null);

    if (!over) return;

    const dealId = active.id as number;
    const newStageId = over.id as number;

    const deal = deals?.find(d => d.id === dealId);
    if (deal && deal.currentStageId !== newStageId) {
      updateDealStageMutation.mutate({
        dealId: dealId,
        toStageId: newStageId,
      });
    }
  };

  const handleCreateStage = () => {
    if (!newStageName.trim()) {
      toast.error("Digite um nome para a etapa");
      return;
    }
    
    createStageMutation.mutate({
      name: newStageName,
      color: newStageColor,
      position: (stages?.length || 0) + 1,
    });
  };

  const handleUpdateStage = () => {
    if (!editingStage) return;
    
    updateStageMutation.mutate({
      id: editingStage.id,
      name: editingStage.name,
      color: editingStage.color,
      position: undefined,
    });
  };

  const handleDeleteStage = (stageId: number) => {
    if (confirm("Tem certeza que deseja deletar esta etapa? As negociações serão movidas para 'Sem Etapa'.")) {
      deleteStageMutation.mutate({ id: stageId });
    }
  };

  const activeDeal = deals?.find(d => d.id === activeDealId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Kanban de Vendas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o fluxo de negociações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={manageStagesOpen} onOpenChange={setManageStagesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Gerenciar Etapas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Etapas do Kanban</DialogTitle>
                <DialogDescription>
                  Personalize as etapas do seu fluxo de vendas
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Nova Etapa */}
                <div className="space-y-3">
                  <h3 className="font-medium">Criar Nova Etapa</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome da etapa"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      value={newStageColor}
                      onChange={(e) => setNewStageColor(e.target.value)}
                      className="w-20"
                    />
                    <Button onClick={handleCreateStage} disabled={createStageMutation.isPending}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Lista de Etapas */}
                <div className="space-y-3">
                  <h3 className="font-medium">Etapas Existentes</h3>
                  <div className="space-y-2">
                    {stages?.map((stage) => (
                      <div key={stage.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        {editingStage?.id === stage.id ? (
                          <>
                            <Input
                              value={editingStage.name}
                              onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                              className="flex-1"
                            />
                            <Input
                              type="color"
                              value={editingStage.color}
                              onChange={(e) => setEditingStage({ ...editingStage, color: e.target.value })}
                              className="w-20"
                            />
                            <Button size="sm" onClick={handleUpdateStage}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingStage(null)}>
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: stage.color || '#6B7280' }}
                            />
                            <span className="flex-1">{stage.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingStage({ id: stage.id, name: stage.name, color: stage.color || '#6B7280' })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStage(stage.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newDealOpen} onOpenChange={setNewDealOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Negociação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Negociação</DialogTitle>
                <DialogDescription>
                  Adicione uma nova oportunidade de venda
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
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

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Negociação *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Ensaio Newborn"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Produto/Serviço</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negotiatedValue">Valor Negociado</Label>
                    <Input
                      id="negotiatedValue"
                      type="number"
                      step="0.01"
                      value={formData.negotiatedValue}
                      onChange={(e) => setFormData({ ...formData, negotiatedValue: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentStageId">Etapa Inicial</Label>
                    <Select
                      value={formData.currentStageId}
                      onValueChange={(value) => setFormData({ ...formData, currentStageId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages?.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id.toString()}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Data Prevista</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setNewDealOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createDealMutation.isPending}>
                    {createDealMutation.isPending ? "Criando..." : "Criar Negociação"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages?.map((stage) => {
            const stageDeals = deals?.filter((d) => d.currentStageId === stage.id && d.status === 'oportunidade') || [];
            
            return (
              <SortableContext key={stage.id} id={stage.id.toString()} items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-shrink-0 w-80">
                  <Card className="h-full shadow-elegant">
                    <CardHeader className="pb-3" style={{ borderTopWidth: 4, borderTopColor: stage.color || '#6B7280' }}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{stage.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {stageDeals.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto space-y-3">
                      {stageDeals.map((deal) => (
                        <DraggableDealCard key={deal.id} deal={deal} onStatusChange={handleStatusChange} />
                      ))}
                      {stageDeals.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhuma negociação
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <Card className="w-80 opacity-90 rotate-3 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{activeDeal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {activeDeal.negotiatedValue && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <DollarSign className="h-4 w-4" />
                    R$ {parseFloat(activeDeal.negotiatedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {(!stages || stages.length === 0) && (
        <Card className="shadow-elegant">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Inicializando etapas do Kanban...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
