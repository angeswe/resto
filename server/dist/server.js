"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const projects_1 = require("./routes/projects");
const endpoints_1 = __importDefault(require("./routes/endpoints"));
const mockApi_1 = __importDefault(require("./routes/mockApi"));
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        // Enable CORS for all routes
        this.app.use((0, cors_1.default)({
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
            credentials: true
        }));
        // Parse JSON bodies
        this.app.use(express_1.default.json({ limit: '50mb' }));
        // Parse URL-encoded bodies
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // HTTP request logging
        this.app.use((0, morgan_1.default)('dev'));
    }
    setupRoutes() {
        // Mount API routes at /api
        const apiRouter = express_1.default.Router();
        apiRouter.use('/projects', projects_1.projectRoutes);
        apiRouter.use('/', endpoints_1.default); // Mount endpoints at root of API router
        this.app.use('/api', apiRouter);
        // Mount mock API routes
        const mockRouter = express_1.default.Router();
        mockRouter.use('/:projectId/*', (req, res, next) => {
            // Extract the actual path from the URL by removing the projectId part
            console.log("req.params", req.params);
            const fullPath = req.params['0'] || '';
            req.mockPath = fullPath.startsWith('/') ? fullPath : '/' + fullPath;
            req.projectId = req.params.projectId;
            next();
        });
        mockRouter.use('/:projectId/*', mockApi_1.default);
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
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/build')));
        // SPA fallback - must be last
        if (config_1.config.nodeEnv === 'production') {
            this.app.get('*', (req, res) => {
                res.sendFile(path_1.default.resolve(__dirname, '../../client/build/index.html'));
            });
        }
    }
    setupErrorHandling() {
        // Handle 404s
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.path}`
            });
        });
        // Handle errors
        this.app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: err.message || 'Something went wrong'
            });
        });
    }
    async start() {
        try {
            // Connect to MongoDB
            await mongoose_1.default.connect(config_1.config.mongoUri);
            console.log('Connected to MongoDB');
            // Start the server
            const port = config_1.config.port;
            this.app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
                console.log(`API routes: http://localhost:${port}/api`);
                console.log(`Mock API routes: http://localhost:${port}/mock/{projectId}/{path}`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
const server = new Server();
server.start();
