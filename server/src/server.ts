import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error';
import { projectRoutes } from './routes/projects';
import endpointRoutes from './routes/endpoints';
import mockApiRoutes from './routes/mockApi';

dotenv.config();

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Enable CORS for all routes
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      credentials: true
    }));

    // Parse JSON bodies
    this.app.use(express.json({ limit: '50mb' }));

    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));

    // HTTP request logging
    this.app.use(morgan('dev'));
  }

  private setupRoutes() {
    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // JSON endpoint for swagger spec
    this.app.get('/swagger.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Mount API routes at /api
    const apiRouter = express.Router();
    apiRouter.use('/projects', projectRoutes);
    apiRouter.use('/', endpointRoutes); // Mount endpoints at root of API router
    this.app.use('/api', apiRouter);

    // Mount mock API routes
    const mockRouter = express.Router();
    mockRouter.use('/:projectId/*', (req: Request & { params: { [key: string]: string } }, res, next) => {
      // Extract the actual path from the URL by removing the projectId part
      console.log("req.params", req.params);
      const fullPath = req.params['0'] || '';
      (req as any).mockPath = fullPath.startsWith('/') ? fullPath : '/' + fullPath;
      (req as any).projectId = req.params.projectId;
      next();
    });
    mockRouter.use('/:projectId/*', mockApiRoutes);
    this.app.use('/mock', mockRouter);

    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Debug route to test path matching
    this.app.use((req, res, next) => {
      console.log('Incoming request:', {
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method
      });
      next();
    });

    // Static files - must be after API routes
    this.app.use(express.static(path.join(__dirname, '../../client/build')));

    // SPA fallback - must be last
    if (config.nodeEnv === 'production') {
      this.app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, '../../client/build/index.html'));
      });
    }
  }

  private setupErrorHandling() {
    // Handle 404s
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
      });
    });

    // Handle errors
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
      });
    });
  }

  public async start() {
    try {
      // Connect to MongoDB
      await mongoose.connect(config.mongoUri);
      console.log('Connected to MongoDB');

      // Start the server
      const port = config.port;
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`API routes: http://localhost:${port}/api`);
        console.log(`Mock API routes: http://localhost:${port}/mock/{projectId}/{path}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Add mockPath to Express Request type
declare global {
  namespace Express {
    interface Request {
      mockPath?: string;
      projectId?: string;
    }
  }
}

const server = new Server();
server.start();
