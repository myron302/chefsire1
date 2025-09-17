import express, { type Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from the built web app
app.use(express.static(path.join(__dirname, '../dist')));

// Simple API endpoint for testing
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const port = parseInt(process.env.PORT || '10000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
