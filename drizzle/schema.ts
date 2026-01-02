import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with subscription plan support for multi-user SaaS model.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "basic", "pro", "enterprise"]).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table - stores customer information for photographers
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // photographer who owns this client
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  category: mysqlEnum("category", ["mae_crianca", "gestante", "outro"]).notNull().default("outro"),
  childBirthday: timestamp("childBirthday"), // for mae_crianca
  pregnancyWeeks: int("pregnancyWeeks"), // for gestante
  notes: text("notes"),
  whatsappImported: boolean("whatsappImported").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Products table - catalog of services/products offered by photographers
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // photographer who owns this product
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  defaultPrice: decimal("defaultPrice", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Kanban stages - customizable pipeline stages per photographer
 */
export const kanbanStages = mysqlTable("kanbanStages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // photographer who owns this stage
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6B7280"), // hex color
  position: int("position").notNull(), // for ordering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KanbanStage = typeof kanbanStages.$inferSelect;
export type InsertKanbanStage = typeof kanbanStages.$inferInsert;

/**
 * Deals/Negotiations table - tracks sales opportunities
 */
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // photographer who owns this deal
  clientId: int("clientId").notNull(),
  productId: int("productId"),
  title: varchar("title", { length: 255 }).notNull(),
  negotiatedValue: decimal("negotiatedValue", { precision: 10, scale: 2 }),
  expectedCloseDate: timestamp("expectedCloseDate"),
  status: mysqlEnum("status", ["oportunidade", "fechada", "perdida"]).default("oportunidade").notNull(),
  currentStageId: int("currentStageId"), // current kanban stage
  lostReason: text("lostReason"), // why deal was lost
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  closedAt: timestamp("closedAt"), // when deal was won/lost
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

/**
 * Deal history - tracks movement through kanban stages
 */
export const dealHistory = mysqlTable("dealHistory", {
  id: int("id").autoincrement().primaryKey(),
  dealId: int("dealId").notNull(),
  fromStageId: int("fromStageId"),
  toStageId: int("toStageId").notNull(),
  movedAt: timestamp("movedAt").defaultNow().notNull(),
  movedBy: int("movedBy").notNull(), // userId
});

export type DealHistory = typeof dealHistory.$inferSelect;
export type InsertDealHistory = typeof dealHistory.$inferInsert;

/**
 * Appointments/Reminders table - scheduling and follow-up system
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // photographer
  clientId: int("clientId"),
  dealId: int("dealId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  completed: boolean("completed").default(false).notNull(),
  type: mysqlEnum("type", ["follow_up", "session", "delivery", "birthday", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Activity log - audit trail for important actions
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // client, deal, appointment
  entityId: int("entityId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // created, updated, moved, etc
  details: text("details"), // JSON string with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Email reminders queue - tracks pending email notifications
 */
export const emailReminders = mysqlTable("emailReminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  appointmentId: int("appointmentId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailReminder = typeof emailReminders.$inferSelect;
export type InsertEmailReminder = typeof emailReminders.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  products: many(products),
  kanbanStages: many(kanbanStages),
  deals: many(deals),
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  deals: many(deals),
  appointments: many(appointments),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  deals: many(deals),
}));

export const kanbanStagesRelations = relations(kanbanStages, ({ one, many }) => ({
  user: one(users, {
    fields: [kanbanStages.userId],
    references: [users.id],
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  user: one(users, {
    fields: [deals.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [deals.clientId],
    references: [clients.id],
  }),
  product: one(products, {
    fields: [deals.productId],
    references: [products.id],
  }),
  currentStage: one(kanbanStages, {
    fields: [deals.currentStageId],
    references: [kanbanStages.id],
  }),
  history: many(dealHistory),
  appointments: many(appointments),
}));

export const dealHistoryRelations = relations(dealHistory, ({ one }) => ({
  deal: one(deals, {
    fields: [dealHistory.dealId],
    references: [deals.id],
  }),
  fromStage: one(kanbanStages, {
    fields: [dealHistory.fromStageId],
    references: [kanbanStages.id],
  }),
  toStage: one(kanbanStages, {
    fields: [dealHistory.toStageId],
    references: [kanbanStages.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  deal: one(deals, {
    fields: [appointments.dealId],
    references: [deals.id],
  }),
}));
