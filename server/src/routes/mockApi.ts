import express, { Request, Response, Router } from 'express';
import { DataGenerator } from '../utils/dataGenerator';
import { Endpoint } from '../models/Endpoint';
import { Project } from '../models/Project';
import { IEndpoint } from '../types';
import { Schema } from '../utils/dataGenerator';
import { Types } from 'mongoose';
import { isValidStatusCodeForMethod, getDefaultSuccessStatusCode, METHOD_STATUS_CODES, HttpMethod } from '../types/http';

const router = express.Router();

/**
 * @swagger
 * /mock/{projectId}/*:
 *   get:
 *     summary: Mock any GET endpoint
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: '*'
 *         required: true
 *         schema:
 *           type: string
 *         description: The endpoint path to mock
 *     responses:
 *       200:
 *         description: Mock response based on endpoint configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dynamic response based on endpoint configuration
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Mock any POST endpoint
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: '*'
 *         required: true
 *         schema:
 *           type: string
 *         description: The endpoint path to mock
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any JSON payload
 *     responses:
 *       200:
 *         description: Mock response based on endpoint configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dynamic response based on endpoint configuration
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Mock any PUT endpoint
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: '*'
 *         required: true
 *         schema:
 *           type: string
 *         description: The endpoint path to mock
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any JSON payload
 *     responses:
 *       200:
 *         description: Mock response based on endpoint configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dynamic response based on endpoint configuration
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Mock any DELETE endpoint
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: '*'
 *         required: true
 *         schema:
 *           type: string
 *         description: The endpoint path to mock
 *     responses:
 *       200:
 *         description: Mock response based on endpoint configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dynamic response based on endpoint configuration
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Mock any PATCH endpoint
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: '*'
 *         required: true
 *         schema:
 *           type: string
 *         description: The endpoint path to mock
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any JSON payload
 *     responses:
 *       200:
 *         description: Mock response based on endpoint configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dynamic response based on endpoint configuration
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Match URL path with endpoint path pattern
function matchPathPattern(urlPath: string, endpointPath: string): { matches: boolean; params: Record<string, string> } {
  // Sanitize inputs
  const sanitizedUrlPath = urlPath.replace(/[^\w\-\/]/g, '');
  const sanitizedEndpointPath = endpointPath.replace(/[^\w\-\/:]/g, '');

  const urlParts = sanitizedUrlPath.split('/').filter(Boolean);
  const endpointParts = sanitizedEndpointPath.split('/').filter(Boolean);

  console.log('Path matching:', {
    urlPath,
    endpointPath,
    urlParts,
    endpointParts
  });

  // Check if this is a parameter path (e.g., :id)
  if (endpointPath.startsWith(':')) {
    // For parameter-only paths, capture the last URL part as the parameter value
    const paramName = endpointPath.slice(1); // Remove the : prefix
    const paramValue = urlParts[urlParts.length - 1];
    if (paramValue) {
      console.log('Parameter match:', { paramName, paramValue });
      return {
        matches: true,
        params: { [paramName]: paramValue }
      };
    }
  }

  // For non-parameter paths, must match exactly
  if (urlParts.length === endpointParts.length) {
    const params: Record<string, string> = {};
    let matches = true;

    for (let i = 0; i < endpointParts.length; i++) {
      const endpointPart = endpointParts[i];
      const urlPart = urlParts[i];

      if (endpointPart.startsWith(':')) {
        // This is a parameter
        const paramName = endpointPart.slice(1);
        params[paramName] = urlPart;
      } else if (endpointPart !== urlPart) {
        // Static parts don't match
        matches = false;
        break;
      }
    }

    if (matches) {
      console.log('Exact match:', { params });
      return { matches: true, params };
    }
  }
  console.log('No match found');
  return { matches: false, params: {} };
}

// Extract path parameters from URL path
function extractPathParameters(urlPath: string, endpointPath: string): Record<string, string> {
  // Sanitize inputs
  const sanitizedUrlPath = urlPath.replace(/[^\w\-\/]/g, '');
  const sanitizedEndpointPath = endpointPath.replace(/[^\w\-\/:]/g, '');

  const urlParts = sanitizedUrlPath.split('/').filter(Boolean);
  const endpointParts = sanitizedEndpointPath.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  for (let i = 0; i < endpointParts.length; i++) {
    const endpointPart = endpointParts[i];
    const urlPart = urlParts[i];

    if (endpointPart.startsWith(':')) {
      // This is a parameter
      const paramName = endpointPart.slice(1);
      params[paramName] = urlPart;
    }
  }

  return params;
}

// Debug route to list all endpoints (Development only)
router.get('/debug', async (req: Request, res: Response) => {
  try {
    // Only allow access if request has valid projectId
    if (!req.projectId || !Types.ObjectId.isValid(req.projectId.toString())) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Debug access requires valid project ID'
      });
    }

    // Only show endpoints for this project
    const endpoints = await Endpoint.find({ projectId: req.projectId }).lean();

    // Filter out sensitive information
    const filteredEndpoints = endpoints.map(ep => ({
      id: ep._id,
      path: ep.path,
      method: ep.method,
      description: ep.description,
      createdAt: ep.createdAt,
      updatedAt: ep.updatedAt
    }));

    res.json({
      endpointCount: filteredEndpoints.length,
      endpoints: filteredEndpoints
    });
  } catch (error) {
    console.error('Error getting endpoints:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch endpoints'
    });
  }
});

// Handle all requests to mock API endpoints
router.all('*', async (req: Request, res: Response) => {
  try {
    // Validate projectId
    if (!req.projectId || !Types.ObjectId.isValid(req.projectId.toString())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid project ID format'
      });
    }

    console.log('Mock API request received:', {
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      mockPath: req.mockPath,
      projectId: req.projectId,
      params: req.params,
      query: req.query,
      method: req.method
    });

    // Find matching endpoint and project
    const [endpoints, project] = await Promise.all([
      Endpoint.find({ projectId: req.projectId }).lean(),
      Project.findOne({ _id: req.projectId }).lean()
    ]);

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    let matchedEndpoint: IEndpoint | null = null;
    let pathParams: Record<string, string> = {};

    // First try to match with parameter paths
    for (const endpoint of endpoints) {
      if (endpoint.method === req.method) {
        // For single GET endpoints, first try to match the parameter path
        if (req.method === 'GET' && endpoint.responseType === 'single' && endpoint.parameterPath) {
          const { matches, params } = matchPathPattern(req.mockPath || '', endpoint.parameterPath);
          if (matches) {
            matchedEndpoint = endpoint;
            pathParams = params;
            break;
          }
        }
        // If no match found with parameter path or not a single GET, try the regular path
        if (!matchedEndpoint) {
          const { matches, params } = matchPathPattern(req.mockPath || '', endpoint.path);
          if (matches) {
            matchedEndpoint = endpoint;
            // Only extract parameters from paths that contain parameters
            if (endpoint.path.includes(':')) {
              pathParams = extractPathParameters(req.mockPath || '', endpoint.path);
            }
            break;
          }
        }
      }
    }

    if (!matchedEndpoint) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No endpoint found matching ${req.method} ${req.mockPath}`
      });
    }

    // Check authentication if required
    if (matchedEndpoint.requireAuth) {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'API key is required for this endpoint'
        });
      }

      // Check if the API key is valid for the project
      if (!project.apiKeys.includes(apiKey as string)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid API key'
        });
      }
    }

    // Handle delay if specified
    if (matchedEndpoint.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, matchedEndpoint.delay));
    }

    // Parse schema definition (handle stringified JSON)
    const schema = typeof matchedEndpoint.schemaDefinition === 'string'
      ? JSON.parse(matchedEndpoint.schemaDefinition)
      : matchedEndpoint.schemaDefinition;

    // Validate schema before generating data
    console.log('Schema to validate:', JSON.stringify(schema, null, 2));
    if (!isValidSchema(schema)) {
      console.error('Invalid schema detected');
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Invalid schema definition'
      });
    }

    // Generate response data
    let responseData;

    // For GET requests with list response type
    if (req.method === 'GET' && matchedEndpoint.responseType === 'list') {
      const maxCount = 100; // Add a reasonable limit
      const count = Math.min(matchedEndpoint.count || 10, maxCount);

      if (matchedEndpoint.supportPagination) {
        const page = Math.max(1, Math.min(parseInt(req.query.page as string) || 1, 1000)); // Add upper bound
        const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || count, maxCount)); // Add bounds
        const totalItems = Math.min(count, maxCount);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalItems);
        const itemsToGenerate = endIndex - startIndex;

        console.log('Generating paginated data:', {
          page,
          limit,
          totalItems,
          startIndex,
          endIndex,
          itemsToGenerate
        });

        responseData = {
          data: DataGenerator.generate(schema, itemsToGenerate),
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
          }
        };
      } else {
        console.log('Generating list data with count:', count);
        responseData = {
          data: DataGenerator.generate(schema, count)
        };
      }
    } else {
      // For all other cases (single GET, POST, PUT, DELETE)
      console.log('Generating single response data');
      responseData = {
        data: DataGenerator.generate(schema, 1)[0]
      };
      // Add path parameters to the response if they exist
      if (Object.keys(pathParams).length > 0) {
        responseData.data = { ...responseData.data, ...pathParams };
      }
    }

    console.log('Generated response data:', JSON.stringify(responseData, null, 2));

    // Send response
    const method = req.method as HttpMethod;
    let statusCode: number;
    try {
      const defaultStatus = getDefaultSuccessStatusCode(method);
      statusCode = parseInt(matchedEndpoint.responseHttpStatus || defaultStatus.toString());
    } catch (e) {
      console.error('Error parsing status code:', e);
      statusCode = 500;
    }

    // Validate status code
    const validStatusCodes = METHOD_STATUS_CODES[method].map(s => parseInt(s.code));
    if (!validStatusCodes.includes(statusCode)) {
      console.error(`Invalid status code ${statusCode} for method ${method}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Invalid status code configuration'
      });
      return;
    }

    res.status(statusCode).json(responseData);

  } catch (err) {
    console.error('Error in mock API:', err);
    // Don't expose internal error details
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
});

// Add schema validation helper
function isValidSchema(schema: Schema | Schema[]): boolean {
  try {
    if (!schema) {
      console.log('Schema is null or undefined');
      return false;
    }

    // Handle array of schemas
    if (Array.isArray(schema)) {
      console.log('Validating array of schemas');
      return schema.every(s => isValidSchema(s));
    }

    // For each property in the schema, validate its value
    for (const [key, value] of Object.entries(schema)) {
      console.log(`Validating schema property "${key}" with value:`, value);

      if (value === null) {
        console.log('Value is null - continuing');
        continue;
      }

      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        console.log('Validating nested object');
        if (!isValidSchema(value as Schema)) {
          console.log('Nested object validation failed');
          return false;
        }
        continue;
      }

      // Handle arrays of schemas
      if (Array.isArray(value)) {
        console.log('Validating array value');
        if (!value.every(v => isValidSchema(v as Schema))) {
          console.log('Array validation failed');
          return false;
        }
        continue;
      }

      // Handle primitive types and random functions
      if (typeof value === 'string') {
        if (value.startsWith('(random:')) {
          console.log('Validating random function string');
          const match = value.match(/^\(random:(\w+)\)$/);
          if (!match) {
            console.log('Invalid random function format');
            return false;
          }
        }
      } else if (!['number', 'boolean', 'string'].includes(typeof value)) {
        console.log(`Invalid value type: ${typeof value}`);
        return false;
      }
    }
    console.log('Schema validation passed');
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}

export default router;
