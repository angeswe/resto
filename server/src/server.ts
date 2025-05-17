// Import Swagger documentation
import './swagger';

import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  Application,
  Request,
  Response,
} from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { endpointRoutes } from './routes/endpoints';
import mockApiRoutes from './routes/mockApi';
import { projectRoutes } from './routes/projects';

dotenv.config();

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Enable CORS for all routes
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:8081'],
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

  private setupRoutes(): void {
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
      const fullPath = req.params['0'] || '';
      (req as any).mockPath = fullPath.startsWith('/') ? fullPath : '/' + fullPath;
      (req as any).projectId = req.params.projectId;
      next();
    });
    mockRouter.use('/:projectId/*', mockApiRoutes);
    this.app.use('/api/mock', mockRouter);

    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Debug route to test path matching
    this.app.use((req, res, next) => {
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

  private setupErrorHandling(): void {
    // Handle 404s
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
      });
    });

    // Handle errors
    this.app.use((err: any, req: express.Request, res: express.Response) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await mongoose.connect(config.mongoUri);

      // Start the server
      const port = config.port;
      this.app.listen(port);
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Add mockPath to Express Request type
declare module "express" {
  interface Request {
    mockPath?: string;
    projectId?: string;
  }
}

const server = new Server();
server.start();
