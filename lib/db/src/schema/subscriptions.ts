import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plan: text("plan").notNull(),
  paymentId: text("payment_id").notNull().unique(),
  pixCode: text("pix_code"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
