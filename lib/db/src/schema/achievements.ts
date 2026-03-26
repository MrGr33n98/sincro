import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const achievementsTable = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: varchar("type", { length: 50 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type Achievement = typeof achievementsTable.$inferSelect;
