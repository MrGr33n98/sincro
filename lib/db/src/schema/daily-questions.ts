import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { couplesTable } from "./couples";

export const dailyQuestionsTable = pgTable("daily_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  category: varchar("category", { length: 50 }).default("general"),
});

export const questionAnswersTable = pgTable("question_answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  coupleId: integer("couple_id").notNull().references(() => couplesTable.id),
  questionId: integer("question_id").notNull().references(() => dailyQuestionsTable.id),
  answer: text("answer").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DailyQuestion = typeof dailyQuestionsTable.$inferSelect;
export type QuestionAnswer = typeof questionAnswersTable.$inferSelect;
