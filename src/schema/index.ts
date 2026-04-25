import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().default(""),
  name: text("name").notNull().default(""),
  isAdmin: boolean("is_admin").notNull().default(false),
  roundsBalance: integer("rounds_balance").notNull().default(1),
  seenQuestionIds: jsonb("seen_question_ids").$type<number[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
  image: text("image"),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promoCodesTable = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  roundsValue: integer("rounds_value").notNull(),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const codeRedemptionsTable = pgTable("code_redemptions", {
  id: serial("id").primaryKey(),
  codeId: integer("code_id").notNull().references(() => promoCodesTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex("code_redemptions_code_user_uniq").on(t.codeId, t.userId),
}));

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  teamsData: jsonb("teams_data").notNull(),
  categoriesData: jsonb("categories_data").notNull(),
  usedQuestionIds: jsonb("used_question_ids").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  rounds: integer("rounds").notNull(),
  priceCents: integer("price_cents").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  payhipUrl: text("payhip_url").notNull().default(""),
  badge: text("badge"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type Question = typeof questionsTable.$inferSelect;
export type PromoCode = typeof promoCodesTable.$inferSelect;
export type Game = typeof gamesTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
