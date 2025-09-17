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
} from "./schema.js";

// Create database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class Storage {
  // Users
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
    return db.select()
      .from(users)
      .where(and(
        sql`${users.id} != ${userId}`,
        eq(users.isChef, true)
      ))
      .orderBy(desc(users.followersCount))
      .limit(limit);
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPostWithUser(id: string): Promise<PostWithUser | undefined> {
    const result = await db.select({
      post: posts,
      user: users,
      recipe: recipes
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
      recipe: result[0].recipe || undefined
    };
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();

    await db.update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, insertPost.userId));

    return result[0];
  }

  async getFeedPosts(userId: string, offset = 0, limit = 10): Promise<PostWithUser[]> {
    const result = await db.select({
      post: posts,
      user: users,
      recipe: recipes
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(recipes, eq(recipes.postId, posts.id))
    .orderBy(desc(posts.createdAt))
    .offset(offset)
    .limit(limit);

    return result.map(row => ({
      ...row.post,
      user: row.user,
      recipe: row.recipe || undefined
    }));
  }

  async getUserPosts(userId: string, offset = 0, limit = 10): Promise<PostWithUser[]> {
    const result = await db.select({
      post: posts,
      user: users,
      recipe: recipes
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(recipes, eq(recipes.postId, posts.id))
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
    .offset(offset)
    .limit(limit);

    return result.map(row => ({
      ...row.post,
      user: row.user,
      recipe: row.recipe || undefined
    }));
  }

  // Recipes
  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
    return result[0];
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const result = await db.insert(recipes).values(insertRecipe).returning();
    return result[0];
  }

  async getTrendingRecipes(limit = 5): Promise<(Recipe & { post: PostWithUser })[]> {
    const result = await db.select({
      recipe: recipes,
      post: posts,
      user: users
    })
    .from(recipes)
    .innerJoin(posts, eq(recipes.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.likesCount))
    .limit(limit);

    return result.map(row => ({
      ...row.recipe,
      post: { ...row.post, user: row.user }
    }));
  }

  async searchRecipes(query?: string, limit = 24, offset = 0): Promise<Recipe[]> {
    let dbQuery = db.select().from(recipes);
    
    if (query) {
      dbQuery = dbQuery.where(
        sql`${recipes.title} ILIKE ${'%' + query + '%'} OR ${recipes.ingredients}::text ILIKE ${'%' + query + '%'}`
      );
    }
    
    return dbQuery.orderBy(desc(recipes.createdAt)).limit(limit).offset(offset);
  }

  // Likes
  async likePost(userId: string, postId: string): Promise<Like> {
    const result = await db.insert(likes).values({ 
      id: crypto.randomUUID(),
      userId, 
      postId 
    }).returning();
    
    await db.update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
    
    return result[0];
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const result = await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();
    
    if (result[0]) {
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      return true;
    }
    return false;
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();
    
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insertComment.postId));
    
    return result[0];
  }

  async getPostComments(postId: string): Promise<CommentWithUser[]> {
    const result = await db.select({
      comment: comments,
      user: users
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

    return result.map(row => ({ ...row.comment, user: row.user }));
  }

  // Follows
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const result = await db.insert(follows).values({ 
      id: crypto.randomUUID(),
      followerId, 
      followingId 
    }).returning();

    await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, followingId));

    return result[0];
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning();

    if (result[0]) {
      await db.update(users).set({ followingCount: sql`${users.followingCount} - 1` }).where(eq(users.id, followerId));
      await db.update(users).set({ followersCount: sql`${users.followersCount} - 1` }).where(eq(users.id, followingId));
      return true;
    }
    return false;
  }
}

export const storage = new Storage();
