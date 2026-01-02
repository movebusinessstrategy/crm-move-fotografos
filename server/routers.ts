import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { whatsapp } from "./whatsapp";

// ============= WHATSAPP ROUTER =============
const whatsappRouter = router({
  getStatus: protectedProcedure.query(() => {
    return {
      status: whatsapp.getStatus(),
      qr: whatsapp.getQR(),
    };
  }),

  start: protectedProcedure.mutation(async () => {
    await whatsapp.start();
    return { success: true };
  }),

  logout: protectedProcedure.mutation(async () => {
    await whatsapp.logout();
    return { success: true };
  }),
});

// ============= CLIENT ROUTER =============
const clientRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getClientsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getClientById(input.id, ctx.user.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      category: z.enum(["mae_crianca", "gestante", "outro"]),
      childBirthday: z.date().optional(),
      pregnancyWeeks: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientId = await db.createClient({
        ...input,
        userId: ctx.user.id,
      });
      
      await db.createActivityLog({
        userId: ctx.user.id,
        entityType: "client",
        entityId: clientId,
        action: "created",
        details: JSON.stringify({ name: input.name }),
      });

      const client = await db.getClientById(clientId, ctx.user.id);
      return client!;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      category: z.enum(["mae_crianca", "gestante", "outro"]).optional(),
      childBirthday: z.date().optional(),
      pregnancyWeeks: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateClient(id, ctx.user.id, data);

      await db.createActivityLog({
        userId: ctx.user.id,
        entityType: "client",
        entityId: id,
        action: "updated",
        details: JSON.stringify(data),
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteClient(input.id, ctx.user.id);

      await db.createActivityLog({
        userId: ctx.user.id,
        entityType: "client",
        entityId: input.id,
        action: "deleted",
        details: null,
      });

      return { success: true };
    }),
});

// ============= PRODUCT ROUTER =============
const productRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getProductsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getProductById(input.id, ctx.user.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      defaultPrice: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createProduct({
        ...input,
        userId: ctx.user.id,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      defaultPrice: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, ctx.user.id, data);

      return { success: true };
    }),
});

// ============= KANBAN ROUTER =============
const kanbanRouter = router({
  listStages: protectedProcedure.query(async ({ ctx }) => {
    return await db.getKanbanStagesByUserId(ctx.user.id);
  }),

  createStage: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      color: z.string().optional(),
      position: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createKanbanStage({
        ...input,
        userId: ctx.user.id,
      });

      return { success: true };
    }),

  updateStage: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      color: z.string().optional(),
      position: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateKanbanStage(id, ctx.user.id, data);

      return { success: true };
    }),

  deleteStage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteKanbanStage(input.id, ctx.user.id);

      return { success: true };
    }),

  initializeDefaultStages: protectedProcedure.mutation(async ({ ctx }) => {
    const existingStages = await db.getKanbanStagesByUserId(ctx.user.id);
    
    if (existingStages.length === 0) {
      const defaultStages = [
        { name: "Novo Lead", color: "#6B7280", position: 1 },
        { name: "Contato Inicial", color: "#3B82F6", position: 2 },
        { name: "Proposta Enviada", color: "#F59E0B", position: 3 },
        { name: "Negociação", color: "#8B5CF6", position: 4 },
        { name: "Sessão Agendada", color: "#10B981", position: 5 },
        { name: "Sessão Realizada", color: "#06B6D4", position: 6 },
        { name: "Edição", color: "#EC4899", position: 7 },
        { name: "Entrega", color: "#14B8A6", position: 8 },
      ];

      for (const stage of defaultStages) {
        await db.createKanbanStage({
          ...stage,
          userId: ctx.user.id,
        });
      }
    }

    return { success: true };
  }),
});

// ============= DEAL ROUTER =============
const dealRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getDealsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getDealById(input.id, ctx.user.id);
    }),

  getByClientId: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getDealsByClientId(input.clientId, ctx.user.id);
    }),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      productId: z.number().optional(),
      title: z.string().min(1),
      negotiatedValue: z.string().optional(),
      expectedCloseDate: z.date().optional(),
      currentStageId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createDeal({
        ...input,
        userId: ctx.user.id,
        status: "oportunidade",
      });

      await db.createActivityLog({
        userId: ctx.user.id,
        entityType: "deal",
        entityId: 0,
        action: "created",
        details: JSON.stringify({ title: input.title }),
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      negotiatedValue: z.string().optional(),
      expectedCloseDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateDeal(id, ctx.user.id, data);

      return { success: true };
    }),

  moveToStage: protectedProcedure
    .input(z.object({
      dealId: z.number(),
      toStageId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const deal = await db.getDealById(input.dealId, ctx.user.id);
      if (!deal) throw new Error("Deal not found");

      await db.createDealHistory({
        dealId: input.dealId,
        fromStageId: deal.currentStageId || undefined,
        toStageId: input.toStageId,
        movedBy: ctx.user.id,
      });

      await db.updateDeal(input.dealId, ctx.user.id, {
        currentStageId: input.toStageId,
      });

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["oportunidade", "fechada", "perdida"]),
      lostReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, lostReason } = input;
      
      await db.updateDeal(id, ctx.user.id, {
        status,
        lostReason: lostReason || null,
        closedAt: status !== "oportunidade" ? new Date() : null,
      });

      await db.createActivityLog({
        userId: ctx.user.id,
        entityType: "deal",
        entityId: id,
        action: `status_${status}`,
        details: JSON.stringify({ status, lostReason }),
      });

      return { success: true };
    }),

  getHistory: protectedProcedure
    .input(z.object({ dealId: z.number() }))
    .query(async ({ input }) => {
      return await db.getDealHistory(input.dealId);
    }),
});

// ============= APPOINTMENT ROUTER =============
const appointmentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAppointmentsByUserId(ctx.user.id);
  }),

  upcoming: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUpcomingAppointments(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number().optional(),
      dealId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      scheduledAt: z.date(),
      type: z.enum(["follow_up", "session", "delivery", "birthday", "other"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createAppointment({
        ...input,
        userId: ctx.user.id,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      scheduledAt: z.date().optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateAppointment(id, ctx.user.id, data);

      return { success: true };
    }),
});

// ============= ANALYTICS ROUTER =============
const analyticsRouter = router({
  getDealStats: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.getDealAnalytics(ctx.user.id, input.startDate, input.endDate);
    }),

  getActivityLog: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.getActivityLogByUserId(ctx.user.id, input.limit);
    }),
});

// ============= MAIN APP ROUTER =============
export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clients: clientRouter,
  products: productRouter,
  kanban: kanbanRouter,
  deals: dealRouter,
  appointments: appointmentRouter,
  analytics: analyticsRouter,
  whatsapp: whatsappRouter,
});

export type AppRouter = typeof appRouter;
