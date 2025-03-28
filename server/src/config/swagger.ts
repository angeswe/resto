import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resto API Documentation',
      version: '1.0.0',
      description: 'Documentation for the Resto API server with dynamic endpoints',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The project ID',
            },
            name: {
              type: 'string',
              description: 'The name of the project',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
          required: ['name'],
        },
        Endpoint: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The endpoint ID',
            },
            projectId: {
              type: 'string',
              description: 'ID of the parent project',
            },
            path: {
              type: 'string',
              description: 'The endpoint path',
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
              description: 'HTTP method',
            },
            response: {
              type: 'object',
              description: 'Response configuration',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
          required: ['projectId', 'path', 'method', 'response'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
