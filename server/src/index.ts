import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { storage } from './storage';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await storage.getRecipes();
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await storage.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch recipe' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = await storage.createRecipe(req.body);
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create recipe' });
  }
});

// Stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await storage.getStories();
    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stories' });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    const story = await storage.getStoryById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch story' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`💊 Health check at http://localhost:${PORT}/health`);
});