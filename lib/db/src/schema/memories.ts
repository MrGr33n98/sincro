import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { couplesTable } from "./couples";

export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  coupleId: integer("couple_id").notNull().references(() => couplesTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }).default("💕"),
  memoryDate: varchar("memory_date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Memory = typeof memoriesTable.$inferSelect;
