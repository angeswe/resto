import express, { Request, Response, Router } from 'express';
import { DataGenerator } from '../utils/dataGenerator';
import { Endpoint } from '../models/Endpoint';
import { Project } from '../models/Project';
import { IEndpoint } from '../types';
import { Schema } from '../utils/dataGenerator';
import { Types } from 'mongoose';
import { isValidStatusCodeForMethod, getDefaultSuccessStatusCode, METHOD_STATUS_CODES, HttpMethod } from '../types/http';

const router = express.Router();

// Match URL path with endpoint path pattern
function matchPathPattern(urlPath: string, endpointPath: string): { matches: boolean; params: Record<string, string> } {
  const urlParts = urlPath.split('/').filter(Boolean);
  const endpointParts = endpointPath.split('/').filter(Boolean);

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
  const urlParts = urlPath.split('/').filter(Boolean);
  const endpointParts = endpointPath.split('/').filter(Boolean);
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

// Debug route to list all endpoints
router.get('/debug', async (req: Request, res: Response) => {
  try {
    const endpoints = await Endpoint.find().lean();
    res.json({
      endpointCount: endpoints.length,
      endpoints: endpoints.map(ep => ({
        path: ep.path,
        method: ep.method,
        projectId: ep.projectId.toString(),
        id: ep._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Handle all requests to mock API endpoints
router.all('*', async (req: Request, res: Response) => {
  try {
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
    // TODO: should we handle count on POST?
    // Find matching endpoint and project
    const [endpoints, project] = await Promise.all([
      Endpoint.find({ projectId: req.projectId }).lean(),
      Project.findById(req.projectId).lean()
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

    // Generate response data
    let responseData;

    // For GET requests with list response type
    if (req.method === 'GET' && matchedEndpoint.responseType === 'list') {
      const count = matchedEndpoint.count || 10;

      if (matchedEndpoint.supportPagination) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || count;
        const totalItems = count;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalItems);
        const itemsToGenerate = endIndex - startIndex;

        responseData = {
          data: DataGenerator.generate(matchedEndpoint.schemaDefinition, itemsToGenerate),
          pagination: {
            page,
            limit,
            totalItems,
            totalPages
          }
        };
      } else {
        responseData = DataGenerator.generate(matchedEndpoint.schemaDefinition, count);
      }
    } else {
      // For all other cases (single GET, POST, PUT, DELETE)
      responseData = DataGenerator.generate(matchedEndpoint.schemaDefinition, 1);
      if (Array.isArray(responseData)) {
        responseData = responseData[0];
      }
      // Add path parameters to the response if they exist
      if (Object.keys(pathParams).length > 0) {
        responseData = { ...responseData, ...pathParams };
      }
    }

    // Send response
    const method = req.method as HttpMethod;
    const statusCode = parseInt(matchedEndpoint.responseHttpStatus || getDefaultSuccessStatusCode(method).toString());
    res.status(statusCode).json(responseData);

  } catch (err) {
    console.error('Error in mock API:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

export default router;
