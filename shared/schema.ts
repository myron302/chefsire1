import { pgTable, text, timestamp, boolean, integer, json, uuid, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Core Tables for MVP

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  isChef: boolean("is_chef").default(false),
  specialty: text("specialty"),
  postsCount: integer("posts_count").default(0),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  isRecipe: boolean("is_recipe").default(false),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => posts.id),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: json("instructions").$type<string[]>().notNull(),
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings"),
  difficulty: text("difficulty"), // Easy, Medium, Hard
  calories: integer("calories"),
  protein: decimal("protein"),
  carbs: decimal("carbs"),
  fat: decimal("fat"),
  fiber: decimal("fiber"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  postId: text("post_id").references(() => posts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  postId: text("post_id").references(() => posts.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").references(() => users.id).notNull(),
  followingId: text("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

// Validation schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPostSchema = createInsertSchema(posts);
export const insertRecipeSchema = createInsertSchema(recipes);
export const insertLikeSchema = createInsertSchema(likes);
export const insertCommentSchema = createInsertSchema(comments);
export const insertFollowSchema = createInsertSchema(follows);

// Complex types for joined data
export type PostWithUser = Post & {
  user: User;
  recipe?: Recipe;
};

export type CommentWithUser = Comment & {
  user: User;
};
