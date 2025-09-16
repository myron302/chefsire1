/**
 * Shared type definitions for Chefsire platform
 * Used across web, mobile, and server components
 */

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cookingTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
  duration?: number; // in minutes
}

export interface Story {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  author?: User;
  recipeId?: string;
  recipe?: Recipe;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Request types
export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: Omit<RecipeStep, 'id'>[];
  cookingTime: number;
  servings: number;
  difficulty: Recipe['difficulty'];
  tags: string[];
  imageUrl?: string;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string;
}

export interface CreateStoryRequest {
  title: string;
  content: string;
  recipeId?: string;
  tags: string[];
  imageUrl?: string;
}