import { pgTable, serial, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const couplesTable = pgTable("couples", {
  id: serial("id").primaryKey(),
  coverPhotoUrl: text("cover_photo_url"),
  anniversaryDate: date("anniversary_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCoupleSchema = createInsertSchema(couplesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCouple = z.infer<typeof insertCoupleSchema>;
export type Couple = typeof couplesTable.$inferSelect;
