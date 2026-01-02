import { eq, and, desc, sql, gte, lte, count, avg } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  clients, 
  InsertClient,
  products,
  InsertProduct,
  kanbanStages,
  InsertKanbanStage,
  deals,
  InsertDeal,
  dealHistory,
  InsertDealHistory,
  appointments,
  InsertAppointment,
  activityLog,
  InsertActivityLog,
  emailReminders,
  InsertEmailReminder
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= CLIENT OPERATIONS =============

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(client);
  // @ts-ignore - insertId exists in mysql2 result
  return Number(result.insertId);
}

export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
}

export async function getClientById(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(
    and(eq(clients.id, clientId), eq(clients.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateClient(clientId: number, userId: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(
    and(eq(clients.id, clientId), eq(clients.userId, userId))
  );
}

export async function deleteClient(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(
    and(eq(clients.id, clientId), eq(clients.userId, userId))
  );
}

// ============= PRODUCT OPERATIONS =============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(product);
  return result;
}

export async function getProductsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products).where(
    and(eq(products.userId, userId), eq(products.isActive, true))
  ).orderBy(desc(products.createdAt));
}

export async function getProductById(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(
    and(eq(products.id, productId), eq(products.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProduct(productId: number, userId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(data).where(
    and(eq(products.id, productId), eq(products.userId, userId))
  );
}

// ============= KANBAN STAGE OPERATIONS =============

export async function createKanbanStage(stage: InsertKanbanStage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(kanbanStages).values(stage);
  return result;
}

export async function getKanbanStagesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(kanbanStages).where(eq(kanbanStages.userId, userId)).orderBy(kanbanStages.position);
}

export async function updateKanbanStage(stageId: number, userId: number, data: Partial<InsertKanbanStage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(kanbanStages).set(data).where(
    and(eq(kanbanStages.id, stageId), eq(kanbanStages.userId, userId))
  );
}

export async function deleteKanbanStage(stageId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(kanbanStages).where(
    and(eq(kanbanStages.id, stageId), eq(kanbanStages.userId, userId))
  );
}

// ============= DEAL OPERATIONS =============

export async function createDeal(deal: InsertDeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deals).values(deal);
  return result;
}

export async function getDealsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(deals).where(eq(deals.userId, userId)).orderBy(desc(deals.createdAt));
}

export async function getDealById(dealId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deals).where(
    and(eq(deals.id, dealId), eq(deals.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDeal(dealId: number, userId: number, data: Partial<InsertDeal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(deals).set(data).where(
    and(eq(deals.id, dealId), eq(deals.userId, userId))
  );
}

export async function getDealsByClientId(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(deals).where(
    and(eq(deals.clientId, clientId), eq(deals.userId, userId))
  ).orderBy(desc(deals.createdAt));
}

// ============= DEAL HISTORY OPERATIONS =============

export async function createDealHistory(history: InsertDealHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(dealHistory).values(history);
}

export async function getDealHistory(dealId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(dealHistory).where(eq(dealHistory.dealId, dealId)).orderBy(desc(dealHistory.movedAt));
}

// ============= APPOINTMENT OPERATIONS =============

export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(appointments).values(appointment);
  return result;
}

export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(appointments).where(eq(appointments.userId, userId)).orderBy(appointments.scheduledAt);
}

export async function getUpcomingAppointments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db.select().from(appointments).where(
    and(
      eq(appointments.userId, userId),
      eq(appointments.completed, false),
      gte(appointments.scheduledAt, now)
    )
  ).orderBy(appointments.scheduledAt).limit(10);
}

export async function updateAppointment(appointmentId: number, userId: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(appointments).set(data).where(
    and(eq(appointments.id, appointmentId), eq(appointments.userId, userId))
  );
}

// ============= ACTIVITY LOG OPERATIONS =============

export async function createActivityLog(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(activityLog).values(log);
}

export async function getActivityLogByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy(desc(activityLog.createdAt)).limit(limit);
}

// ============= EMAIL REMINDER OPERATIONS =============

export async function createEmailReminder(reminder: InsertEmailReminder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(emailReminders).values(reminder);
}

export async function getPendingEmailReminders() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db.select().from(emailReminders).where(
    and(
      eq(emailReminders.status, "pending"),
      lte(emailReminders.scheduledFor, now)
    )
  ).limit(100);
}

export async function updateEmailReminderStatus(reminderId: number, status: "sent" | "failed", errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emailReminders).set({
    status,
    sentAt: status === "sent" ? new Date() : undefined,
    errorMessage: errorMessage || null,
  }).where(eq(emailReminders.id, reminderId));
}

// ============= ANALYTICS OPERATIONS =============

export async function getDealAnalytics(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [eq(deals.userId, userId)];
  if (startDate) conditions.push(gte(deals.createdAt, startDate));
  if (endDate) conditions.push(lte(deals.createdAt, endDate));

  const totalDeals = await db.select({ count: count() }).from(deals).where(and(...conditions));
  
  const wonDeals = await db.select({ count: count() }).from(deals).where(
    and(...conditions, eq(deals.status, "fechada"))
  );
  
  const lostDeals = await db.select({ count: count() }).from(deals).where(
    and(...conditions, eq(deals.status, "perdida"))
  );
  
  const opportunityDeals = await db.select({ count: count() }).from(deals).where(
    and(...conditions, eq(deals.status, "oportunidade"))
  );

  return {
    total: totalDeals[0]?.count || 0,
    won: wonDeals[0]?.count || 0,
    lost: lostDeals[0]?.count || 0,
    opportunities: opportunityDeals[0]?.count || 0,
    conversionRate: totalDeals[0]?.count ? ((wonDeals[0]?.count || 0) / totalDeals[0].count) * 100 : 0,
  };
}

export async function getAverageTimeInStages(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // This is a complex query that would need raw SQL for accurate stage time calculation
  // For now, return empty array - will be implemented with proper time tracking
  return [];
}
