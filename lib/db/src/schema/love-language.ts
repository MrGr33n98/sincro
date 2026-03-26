import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const loveLanguageResultsTable = pgTable("love_language_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  wordsOfAffirmation: integer("words_of_affirmation").notNull().default(0),
  actsOfService: integer("acts_of_service").notNull().default(0),
  receivingGifts: integer("receiving_gifts").notNull().default(0),
  qualityTime: integer("quality_time").notNull().default(0),
  physicalTouch: integer("physical_touch").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LoveLanguageResult = typeof loveLanguageResultsTable.$inferSelect;
