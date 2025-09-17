// shared/schema.ts
// Your MVP schema with minimal additions to support TheMealDB imports, images, and search.

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  decimal,
} from "drizzle-orm/pg-core";
import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ============================
 * USERS
 * ============================ */
export const users = pgTable(
  "users",
  {
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
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_uq").on(t.email),
    usernameUq: uniqueIndex("users_username_uq").on(t.username),
  })
);

/* ============================
 * POSTS
 * ============================ */
export const posts = pgTable(
  "posts",
  {
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
  },
  (t) => ({
    userIdx: index("posts_user_idx").on(t.userId),
    createdIdx: index("posts_created_idx").on(t.createdAt),
  })
);

/* ============================
 * RECIPES
 * Key additions for TheMealDB:
 *  - source: "user" | "mealdb"
 *  - sourceId: idMeal (string)
 *  - imageUrl: strMealThumb (you already have this)
 *  - instructions: long text (MealDB gives a block of text) BUT we’ll still allow string[] for your UI; see note below.
 *  - cuisine/category/tags/youtube/sourceUrl/searchText
 *  - ingredients normalized: [{ name, measure }]
 * ============================ */

// Normalized ingredient item shape
export const ingredientItemZ = z.object({
  name: z.string().min(1),
  measure: z.string().min(1).nullable().optional(), // MealDB sometimes missing measure
});
export type IngredientItem = z.infer<typeof ingredientItemZ>;

// String-array fallback for instructions (you already used string[])
const instructionsZ = z.array(z.string().min(1));

export const recipes = pgTable(
  "recipes",
  {
    id: text("id").primaryKey(),
    postId: text("post_id").references(() => posts.id),

    // Who/where it came from
    source: text("source").default("user").notNull(), // "user" | "mealdb"
    sourceId: text("source_id"), // TheMealDB: idMeal

    // Core display
    title: text("title").notNull(), // TheMealDB: strMeal
    imageUrl: text("image_url"), // TheMealDB: strMealThumb

    // Normalized ingredients: [{ name, measure }]
    ingredients: json("ingredients").$type<IngredientItem[]>().notNull(),

    // Keep your string[] instructions, but we’ll allow long text ingestion later
    instructions: json("instructions").$type<string[]>().notNull(),

    // Extras for classification & linking
    cuisine: text("cuisine"), // TheMealDB: strArea
    category: text("category"), // TheMealDB: strCategory
    tags: json("tags").$type<string[] | null>().default(null), // TheMealDB: strTags split by comma
    youtubeUrl: text("youtube_url"), // TheMealDB: strYoutube
    sourceUrl: text("source_url"), // TheMealDB: strSource / external reference

    // Search helper (denormalized)
    searchText: text("search_text"),

    // Optional nutrition you already included
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
  },
  (t) => ({
    sourceIdx: index("recipes_source_idx").on(t.source),
    titleIdx: index("recipes_title_idx").on(t.title),
    searchIdx: index("recipes_search_idx").on(t.searchText),
    // Prevent duplicate MealDB imports while allowing user recipes to coexist
    mealdbUnique: uniqueIndex("recipes_mealdb_sourceid_uq").on(t.source, t.sourceId),
  })
);

/* ============================
 * LIKES / COMMENTS / FOLLOWS
 * ============================ */
export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    postId: text("post_id").references(() => posts.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userPostUq: uniqueIndex("likes_user_post_uq").on(t.userId, t.postId),
    userIdx: index("likes_user_idx").on(t.userId),
    postIdx: index("likes_post_idx").on(t.postId),
  })
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    postId: text("post_id").references(() => posts.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("comments_user_idx").on(t.userId),
    postIdx: index("comments_post_idx").on(t.postId),
    createdIdx: index("comments_created_idx").on(t.createdAt),
  })
);

export const follows = pgTable(
  "follows",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id").references(() => users.id).notNull(),
    followingId: text("following_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pairUq: uniqueIndex("follows_pair_uq").on(t.followerId, t.followingId),
    followerIdx: index("follows_follower_idx").on(t.followerId),
    followingIdx: index("follows_following_idx").on(t.followingId),
  })
);

/* ============================
 * TYPES (inferred)
 * ============================ */
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
export type { IngredientItem };

/* ============================
 * VALIDATION (Zod)
 * Keep simple, you can extend later.
 * ============================ */
export const insertUserSchema = createInsertSchema(users);
export const insertPostSchema = createInsertSchema(posts);

// Enforce normalized ingredients and either string[] instructions,
// while keeping all new optional MealDB-related fields valid.
export const insertRecipeSchema = createInsertSchema(recipes).superRefine((val, ctx) => {
  // ingredients must match IngredientItem[]
  const parseIng = z.array(ingredientItemZ).safeParse(val.ingredients);
  if (!parseIng.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "ingredients must be an array of { name: string; measure?: string|null }",
      path: ["ingredients"],
    });
  }

  // instructions must be string[]
  const parseInstr = instructionsZ.safeParse(val.instructions);
  if (!parseInstr.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "instructions must be a string[]",
      path: ["instructions"],
    });
  }
});

export const insertLikeSchema = createInsertSchema(likes);
export const insertCommentSchema = createInsertSchema(comments);
export const insertFollowSchema = createInsertSchema(follows);

/* ============================
 * Helpers for search endpoint
 * ============================ */
export const recipeSearchQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  cuisine: z.string().optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
});
export type RecipeSearchQuery = z.infer<typeof recipeSearchQuery>;
