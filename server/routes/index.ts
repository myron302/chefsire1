// server/routes/index.ts
import { Router } from "express";
import { recipesRouter } from "./recipes";
import { subsRouter } from "./substitutions";

export const apiRouter = Router();

// Mount as /api/...
apiRouter.use(recipesRouter);
apiRouter.use(subsRouter);
