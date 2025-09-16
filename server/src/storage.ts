/**
 * Storage layer for Chefsire API
 * This is a placeholder implementation using in-memory storage
 * Replace with your preferred database solution (MongoDB, PostgreSQL, etc.)
 */

import { User, Recipe, Story, CreateRecipeRequest, CreateStoryRequest } from '@chefsire/shared';

// In-memory storage (replace with actual database)
const users: User[] = [
  {
    id: '1',
    email: 'chef@example.com',
    username: 'masterchef',
    displayName: 'Master Chef',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Passionate about creating delicious meals',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Perfect Pasta Carbonara',
    description: 'A classic Italian pasta dish with eggs, cheese, and pancetta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: 400, unit: 'g', notes: 'Use high-quality pasta' },
      { id: '2', name: 'Pancetta', amount: 200, unit: 'g' },
      { id: '3', name: 'Eggs', amount: 4, unit: 'large' },
      { id: '4', name: 'Parmesan cheese', amount: 100, unit: 'g', notes: 'Freshly grated' }
    ],
    steps: [
      { id: '1', stepNumber: 1, instruction: 'Boil water and cook spaghetti according to package instructions' },
      { id: '2', stepNumber: 2, instruction: 'Cook pancetta in a large pan until crispy' },
      { id: '3', stepNumber: 3, instruction: 'Whisk eggs with grated Parmesan cheese' },
      { id: '4', stepNumber: 4, instruction: 'Combine hot pasta with pancetta and egg mixture off heat' }
    ],
    cookingTime: 20,
    servings: 4,
    difficulty: 'medium',
    tags: ['italian', 'pasta', 'quick'],
    authorId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

const stories: Story[] = [
  {
    id: '1',
    title: 'The Story Behind My Grandmother\'s Recipe',
    content: 'This carbonara recipe has been passed down through three generations in my family...',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    authorId: '1',
    recipeId: '1',
    tags: ['family', 'tradition', 'italian'],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

export const storage = {
  // Users
  async getUsers(): Promise<User[]> {
    return [...users];
  },

  async getUserById(id: string): Promise<User | null> {
    return users.find(user => user.id === id) || null;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return recipes.map(recipe => ({
      ...recipe,
      author: users.find(user => user.id === recipe.authorId)
    }));
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    const recipe = recipes.find(recipe => recipe.id === id);
    if (!recipe) return null;

    return {
      ...recipe,
      author: users.find(user => user.id === recipe.authorId)
    };
  },

  async createRecipe(recipeData: CreateRecipeRequest): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipeData,
      id: Date.now().toString(),
      authorId: '1', // Default to first user for now
      ingredients: recipeData.ingredients.map((ing, index) => ({
        ...ing,
        id: `${Date.now()}-${index}`
      })),
      steps: recipeData.steps.map((step, index) => ({
        ...step,
        id: `${Date.now()}-${index}`,
        stepNumber: index + 1
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    recipes.push(newRecipe);
    return newRecipe;
  },

  // Stories
  async getStories(): Promise<Story[]> {
    return stories.map(story => ({
      ...story,
      author: users.find(user => user.id === story.authorId),
      recipe: story.recipeId ? recipes.find(recipe => recipe.id === story.recipeId) : undefined
    }));
  },

  async getStoryById(id: string): Promise<Story | null> {
    const story = stories.find(story => story.id === id);
    if (!story) return null;

    return {
      ...story,
      author: users.find(user => user.id === story.authorId),
      recipe: story.recipeId ? recipes.find(recipe => recipe.id === story.recipeId) : undefined
    };
  },

  async createStory(storyData: CreateStoryRequest): Promise<Story> {
    const newStory: Story = {
      ...storyData,
      id: Date.now().toString(),
      authorId: '1', // Default to first user for now
      createdAt: new Date(),
      updatedAt: new Date()
    };
    stories.push(newStory);
    return newStory;
  }
};