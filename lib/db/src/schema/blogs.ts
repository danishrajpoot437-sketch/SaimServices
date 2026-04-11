import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogsTable = pgTable("blogs", {
  id:          serial("id").primaryKey(),
  title:       text("title").notNull(),
  slug:        text("slug").notNull().unique(),
  excerpt:     text("excerpt").notNull(),
  content:     text("content").notNull(),
  category:    text("category").notNull().default("general"),
  tags:        text("tags").notNull().default(""),
  coverImage:  text("cover_image"),
  author:      text("author").notNull().default("Saim"),
  status:      text("status").notNull().default("draft"),
  readTime:    integer("read_time").notNull().default(3),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogSchema = createInsertSchema(blogsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog      = typeof blogsTable.$inferSelect;
