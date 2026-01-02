import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-photographer",
    email: "photographer@test.com",
    name: "Test Photographer",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("CRM - Clientes", () => {
  it("deve criar um cliente com sucesso", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      name: "Maria Silva",
      phone: "(11) 98765-4321",
      email: "maria@example.com",
      category: "mae_crianca",
      childBirthday: new Date("2020-05-15"),
    });

    expect(client).toBeDefined();
    expect(client.name).toBe("Maria Silva");
    expect(client.category).toBe("mae_crianca");
  });

  it("deve listar clientes do usuário", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar cliente primeiro
    await caller.clients.create({
      name: "João Santos",
      phone: "(11) 91234-5678",
      category: "outro",
    });

    const clients = await caller.clients.list();

    expect(clients).toBeDefined();
    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBeGreaterThan(0);
  });

  it("deve atualizar informações do cliente", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      name: "Ana Costa",
      category: "gestante",
      pregnancyWeeks: 20,
    });

    const updated = await caller.clients.update({
      id: client.id,
      pregnancyWeeks: 25,
    });

    expect(updated.pregnancyWeeks).toBe(25);
  });
});

describe("CRM - Produtos", () => {
  it("deve criar um produto", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.create({
      name: "Ensaio Newborn",
      defaultPrice: "1500.00",
      description: "Ensaio fotográfico de recém-nascido",
    });

    expect(product).toBeDefined();
    expect(product.name).toBe("Ensaio Newborn");
    expect(product.defaultPrice).toBe("1500.00");
  });

  it("deve listar produtos do fotógrafo", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.products.create({
      name: "Ensaio Gestante",
      defaultPrice: "1200.00",
    });

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("CRM - Kanban e Negociações", () => {
  it("deve inicializar etapas padrão do Kanban", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.kanban.initializeDefaultStages();

    const stages = await caller.kanban.listStages();

    expect(stages).toBeDefined();
    expect(stages.length).toBeGreaterThan(0);
    expect(stages.some(s => s.name === "Novo Lead")).toBe(true);
  });

  it("deve criar uma negociação", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar cliente primeiro
    const client = await caller.clients.create({
      name: "Cliente Teste",
      category: "outro",
    });

    // Criar produto
    const product = await caller.products.create({
      name: "Produto Teste",
      defaultPrice: "1000.00",
    });

    // Criar negociação
    const deal = await caller.deals.create({
      clientId: client.id,
      productId: product.id,
      title: "Negociação Teste",
      negotiatedValue: "1000.00",
      expectedCloseDate: new Date("2026-02-01"),
    });

    expect(deal).toBeDefined();
    expect(deal.title).toBe("Negociação Teste");
    expect(deal.status).toBe("oportunidade");
  });

  it("deve atualizar status da negociação para fechada", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      name: "Cliente Venda",
      category: "outro",
    });

    const deal = await caller.deals.create({
      clientId: client.id,
      title: "Venda Teste",
      negotiatedValue: "2000.00",
    });

    const updated = await caller.deals.updateStatus({
      id: deal.id,
      status: "fechada",
    });

    expect(updated.status).toBe("fechada");
  });
});

describe("CRM - Agendamentos", () => {
  it("deve criar um agendamento", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      name: "Cliente Agendamento",
      category: "outro",
    });

    const appointment = await caller.appointments.create({
      clientId: client.id,
      title: "Sessão Fotográfica",
      scheduledAt: new Date("2026-02-15T14:00:00"),
      type: "session",
    });

    expect(appointment).toBeDefined();
    expect(appointment.title).toBe("Sessão Fotográfica");
    expect(appointment.type).toBe("session");
  });

  it("deve listar agendamentos futuros", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.appointments.create({
      title: "Agendamento Futuro",
      scheduledAt: new Date("2026-03-01T10:00:00"),
      type: "follow_up",
    });

    const upcoming = await caller.appointments.upcoming({ days: 60 });

    expect(upcoming).toBeDefined();
    expect(Array.isArray(upcoming)).toBe(true);
  });

  it("deve marcar agendamento como concluído", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const appointment = await caller.appointments.create({
      title: "Agendamento para Concluir",
      scheduledAt: new Date("2026-01-10T10:00:00"),
      type: "other",
    });

    const updated = await caller.appointments.update({
      id: appointment.id,
      completed: true,
    });

    expect(updated.completed).toBe(true);
  });
});

describe("CRM - Analytics", () => {
  it("deve calcular estatísticas de negociações", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar cliente
    const client = await caller.clients.create({
      name: "Cliente Stats",
      category: "outro",
    });

    // Criar negociações com diferentes status
    await caller.deals.create({
      clientId: client.id,
      title: "Venda 1",
      negotiatedValue: "1000.00",
      status: "fechada",
    });

    await caller.deals.create({
      clientId: client.id,
      title: "Venda 2",
      negotiatedValue: "1500.00",
      status: "perdida",
    });

    await caller.deals.create({
      clientId: client.id,
      title: "Oportunidade 1",
      negotiatedValue: "2000.00",
      status: "oportunidade",
    });

    const stats = await caller.analytics.getDealStats({});

    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(3);
    expect(stats.won).toBeGreaterThanOrEqual(1);
    expect(stats.lost).toBeGreaterThanOrEqual(1);
    expect(stats.opportunities).toBeGreaterThanOrEqual(1);
    expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
  });
});
