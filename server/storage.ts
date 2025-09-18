// server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import {
  users,
  posts,
  recipes,
  likes,
  comments,
  follows,
  type User,
  type InsertUser,
  type Post,
  type InsertPost,
  type Recipe,
  type InsertRecipe,
  type Like,
  type InsertLike,
  type Comment,
  type InsertComment,
  type Follow,
  type InsertFollow,
  type PostWithUser,
  type CommentWithUser,
} from "../shared/schema"; // ✅ fixed path

// Create database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class Storage {
  // ---------------- USERS ----------------
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getSuggestedUsers(userId: string, limit = 5): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(sql`${users.id} != ${userId}`, eq(users.isChef, true)))
      .orderBy(desc(users.followersCount))
      .limit(limit);
  }

  // ---------------- POSTS ----------------
  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPostWithUser(id: string): Promise<PostWithUser | undefined> {
    const result = await db
      .select({
        post: posts,
        user: users,
        recipe: recipes,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(recipes, eq(recipes.postId, posts.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!result[0]) return undefined;

    return {
      ...result[0].post,
      user: result[0].user,
      recipe: result[0].recipe || undefined,
    };
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();

    await db
      .update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, insertPost.userId));

    return result[0];
  }

  async getFeedPosts(userId: string, offset = 0, limit = 10): Promise<PostWithUser[]> {
    const result = await db
      .select({
        post: posts,
        user: users,
        recipe: recipes,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(recipes, eq(recipes.postId, posts.id))
      .orderBy(desc(posts.createdAt))
      .offset(offset)
      .limit(limit);

    return result.map((row) => ({
      ...row.post,
      user: row.user,
      recipe: row.recipe || undefined,
    }));
  }

  async getUserPosts(userId: string, offset = 0, limit = 10): Promise<PostWithUser[]> {
    const result = await db
      .select({
        post: posts,
        user: users,
        recipe: recipes,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(recipes, eq(recipes.postId, posts.id))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .offset(offset)
      .limit(limit);

    return result.map((row) => ({
      ...row.post,
      user: row.user,
      recipe: row.recipe || undefined,
    }));
  }

  // ---------------- RECIPES ----------------
  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
    return result[0];
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const result = await db.insert(recipes).values(insertRecipe).returning();
    return result[0];
  }

  async getTrendingRecipes(limit = 5): Promise<(Recipe & { post: PostWithUser })[]> {
    const result = await db
      .select({
        recipe: recipes,
        post: posts,
        user: users,
      })
      .from(recipes)
      .innerJoin(posts, eq(recipes.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.likesCount))
      .limit(limit);

    return result.map((row) => ({
      ...row.recipe,
      post: { ...row.post, user: row.user },
    }));
  }

  async searchRecipes(query?: string, limit = 24, offset = 0): Promise<Recipe[]> {
    let dbQuery = db.select().from(recipes);

    if (query) {
      dbQuery = dbQuery.where(
        sql`${recipes.title} ILIKE ${"%" + query + "%"} OR ${recipes.ingredients}::text ILIKE ${
          "%" + query + "%"
        }`
      );
    }

    return dbQuery.orderBy(desc(recipes.createdAt)).limit(limit).offset(offset);
  }

  /** 🔹 Find a recipe by external source (e.g., TheMealDB) */
  async getRecipeBySourceId(source: string, sourceId: string) {
    const result = await db
      .select()
      .from(recipes)
      .where(sql`${recipes.source} = ${source} AND ${recipes.sourceId} = ${sourceId}`)
      .limit(1);
    return result[0];
  }

  /** 🔹 Upsert a MealDB recipe (dedupes by source+sourceId) */
  async upsertMealDbRecipe(n: {
    sourceId: string;
    title: string;
    imageUrl?: string | null;
    instructionsSteps: string[];
    ingredients: { name: string; measure: string | null }[];
    cuisine?: string | null;
    category?: string | null;
    tags?: string[] | null;
    youtubeUrl?: string | null;
    sourceUrl?: string | null;
    searchText: string;
    postId?: string | null;
  }) {
    const existing = await this.getRecipeBySourceId("mealdb", n.sourceId);

    if (existing) {
      const [updated] = await db
        .update(recipes)
        .set({
          title: n.title,
          imageUrl: n.imageUrl ?? existing.imageUrl,
          instructions: n.instructionsSteps,
          ingredients: n.ingredients,
          cuisine: n.cuisine ?? existing.cuisine,
          category: n.category ?? existing.category,
          tags: n.tags ?? existing.tags,
          youtubeUrl: n.youtubeUrl ?? existing.youtubeUrl,
          sourceUrl: n.sourceUrl ?? existing.sourceUrl,
          searchText: n.searchText ?? existing.searchText,
          updatedAt: sql`NOW()`,
        })
        .where(sql`${recipes.source} = 'mealdb' AND ${recipes.sourceId} = ${n.sourceId}`)
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(recipes)
      .values({
        id: crypto.randomUUID(),
        postId: n.postId ?? null,
        source: "mealdb",
        sourceId: n.sourceId,
        title: n.title,
        imageUrl: n.imageUrl ?? null,
        instructions: n.instructionsSteps,
        ingredients: n.ingredients,
        cuisine: n.cuisine ?? null,
        category: n.category ?? null,
        tags: n.tags ?? null,
        youtubeUrl: n.youtubeUrl ?? null,
        sourceUrl: n.sourceUrl ?? null,
        searchText: n.searchText,
      })
      .returning();

    return inserted;
  }

  // ---------------- LIKES ----------------
  async likePost(userId: string, postId: string): Promise<Like> {
    const result = await db
      .insert(likes)
      .values({
        id: crypto.randomUUID(),
        userId,
        postId,
      })
      .returning();

    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));

    return result[0];
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();

    if (result[0]) {
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      return true;
    }
    return false;
  }

  // ---------------- COMMENTS ----------------
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();

    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insertComment.postId));

    return result[0];
  }

  async getPostComments(postId: string): Promise<CommentWithUser[]> {
    const result = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    return result.map((row) => ({ ...row.comment, user: row.user }));
  }

  // ---------------- FOLLOWS ----------------
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const result = await db
      .insert(follows)
      .values({
        id: crypto.randomUUID(),
        followerId,
        followingId,
      })
      .returning();

    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, followingId));

    return result[0];
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning();

    if (result[0]) {
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} - 1` })
        .where(eq(users.id, followerId));
      await db
        .update(users)
        .set({ followersCount: sql`${users.followersCount} - 1` })
        .where(eq(users.id, followingId));
      return true;
    }
    return false;
  }
}

// ✅ must remain at end
export const storage = new Storage();
