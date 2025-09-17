import express, { type Request, Response } from "express";
import { storage } from "./storage.js";
import { fetchRecipesFromTheMealDB } from "./recipes-service.js";
import {
  insertUserSchema,
  insertPostSchema,
  insertRecipeSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertFollowSchema,
} from "./schema.js";
import { z } from "zod";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Mock auth for now
const authenticateUser = (req: any, res: any, next: any) => {
  req.user = { id: "user-123" };
  next();
};

// ========== USERS ==========
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid user data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.get("/api/users/:id/suggested", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const users = await storage.getSuggestedUsers(req.params.id, limit);
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch suggested users" });
  }
});

// ========== POSTS ==========
app.get("/api/posts/feed/:userId", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await storage.getFeedPosts(req.params.userId, offset, limit);
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

app.get("/api/posts/user/:userId", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await storage.getUserPosts(req.params.userId, offset, limit);
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await storage.getPostWithUser(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch {
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const postData = insertPostSchema.parse(req.body);
    const post = await storage.createPost(postData);
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid post data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create post" });
  }
});

// ========== RECIPES ==========
app.get("/api/recipes/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const recipes = await storage.getTrendingRecipes(limit);
    res.json(recipes);
  } catch {
    res.status(500).json({ message: "Failed to fetch trending recipes" });
  }
});

app.get("/api/recipes/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 24;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const recipes = await storage.searchRecipes(query, limit, offset);
    res.json({ 
      results: recipes, 
      total: recipes.length,
      source: "local" 
    });
  } catch {
    res.status(500).json({ message: "Failed to search recipes" });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const recipeData = insertRecipeSchema.parse(req.body);
    const recipe = await storage.createRecipe(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create recipe" });
  }
});

// ========== RECIPE FETCHING ==========
app.post("/api/recipes/fetch", authenticateUser, async (req, res) => {
  try {
    console.log("Starting recipe fetch from TheMealDB...");
    const result = await fetchRecipesFromTheMealDB();
    
    res.status(201).json({
      message: "Recipes fetched and inserted successfully",
      success: result.success,
      count: result.count,
      processed: result.processed,
      withImages: result.withImages,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ 
      message: "Failed to fetch recipes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// ========== LIKES ==========
app.post("/api/likes", async (req, res) => {
  try {
    const likeData = insertLikeSchema.parse(req.body);
    const like = await storage.likePost(likeData.userId, likeData.postId);
    res.status(201).json(like);
  } catch (error) {
