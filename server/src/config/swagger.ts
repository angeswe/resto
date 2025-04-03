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
            defaultSchema: {
              type: 'object',
              description: 'Default data generation schema',
              example: {
                id: "(random:uuid)",
                name: "(random:name)",
                email: "(random:email)",
                createdAt: "(random:datetime)"
              }
            },
            defaultCount: {
              type: 'integer',
              description: 'Default number of items to generate',
              minimum: 1,
              maximum: 10000,
              default: 10
            },
            requireAuth: {
              type: 'boolean',
              description: 'Whether authentication is required for endpoints',
              default: false
            },
            apiKeys: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of API keys authorized for this project',
              default: []
            },
            endpoints: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Endpoint'
              },
              description: 'List of endpoints associated with this project'
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
            schemaDefinition: {
              type: 'object',
              description: 'Schema definition for data generation',
            },
            count: {
              type: 'integer',
              description: 'Number of items to generate',
              minimum: 1,
              maximum: 10000,
              default: 10
            },
            supportPagination: {
              type: 'boolean',
              description: 'Whether endpoint supports pagination',
              default: false
            },
            requireAuth: {
              type: 'boolean',
              description: 'Whether authentication is required',
              default: false
            },
            apiKeys: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of API keys authorized for this endpoint',
              default: []
            },
            delay: {
              type: 'integer',
              description: 'Response delay in milliseconds',
              minimum: 0,
              maximum: 5000,
              default: 0
            },
            responseType: {
              type: 'string',
              enum: ['list', 'single'],
              description: 'Type of response (list or single item)',
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
          required: ['projectId', 'path', 'method', 'schemaDefinition', 'count', 'responseType'],
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
