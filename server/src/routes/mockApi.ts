import express, { Request, Response, Router } from 'express';
import { DataGenerator } from '../utils/dataGenerator';
import { Endpoint } from '../models/Endpoint';
import { IEndpoint } from '../types';
import { Schema } from '../utils/dataGenerator';
import { Types } from 'mongoose';

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

    const projectId = req.projectId;
    if (!projectId) {
      console.error('No projectId in params:', req.params);
      return res.status(400).json({
        error: 'Missing Project ID',
        message: 'Project ID is required'
      });
    }

    // Convert projectId to proper MongoDB ObjectId format
    let projectObjectId: Types.ObjectId;
    try {
      projectObjectId = new Types.ObjectId(projectId);
      console.log('Converted projectId to ObjectId:', {
        raw: projectId,
        objectId: projectObjectId.toString()
      });
    } catch (err) {
      console.error('Invalid projectId format:', projectId);
      return res.status(400).json({
        error: 'Invalid Project ID',
        message: 'The provided project ID format is invalid'
      });
    }

    // Get the actual path from the mockPath set by middleware
    const requestPath = req.mockPath || '';
    console.log('Request path info:', {
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      mockPath: req.mockPath,
      params: req.params,
      extractedPath: requestPath
    });

    // Debug: List all endpoints in the project
    const allEndpoints = await Endpoint.find({ projectId: projectObjectId }).lean() as IEndpoint[];
    console.log('All endpoints in project:', allEndpoints.map(ep => ({
      path: ep.path,
      method: ep.method,
      id: ep._id.toString(),
      projectId: ep.projectId.toString(),
      parameterPath: ep.parameterPath,
      responseType: ep.responseType
    })));

    // Find the matching endpoint by checking path patterns
    let matchedEndpoint: IEndpoint | null = null;
    let matchedParams: Record<string, string> = {};

    for (const endpoint of allEndpoints) {
      if (endpoint.method !== req.method) continue;

      // Get the base path without parameters
      const basePath = '/' + requestPath.split('/').filter(Boolean)[0];
      const endpointBasePath = '/' + endpoint.path.split('/').filter(Boolean)[0];

      console.log('Comparing paths:', {
        basePath,
        endpointBasePath,
        requestPath,
        endpointPath: endpoint.path,
        parameterPath: endpoint.parameterPath
      });

      // First ensure base paths match
      if (basePath === endpointBasePath) {
        // If we have a parameter path, try that first
        if (endpoint.parameterPath) {
          const { matches: paramMatches, params } = matchPathPattern(requestPath, endpoint.parameterPath);
          if (paramMatches) {
            matchedEndpoint = endpoint;
            matchedParams = params;
            console.log('Found matching endpoint with parameter path:', {
              path: endpoint.path,
              parameterPath: endpoint.parameterPath,
              requestPath,
              params
            });
            break;
          }
        }

        // If no parameter path or it didn't match, try the base path
        const { matches: baseMatches, params } = matchPathPattern(requestPath, endpoint.path);
        if (baseMatches) {
          matchedEndpoint = endpoint;
          matchedParams = params;
          console.log('Found matching endpoint with base path:', {
            path: endpoint.path,
            requestPath,
            params
          });
          break;
        }
      }
    }

    if (!matchedEndpoint) {
      console.log('No endpoint found for:', { 
        projectId: projectObjectId.toString(), 
        path: requestPath,
        method: req.method 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: `No endpoint found for ${req.method} ${requestPath}`
      });
    }

    // Check if authentication is required
    if (matchedEndpoint.requireAuth) {
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || !matchedEndpoint.apiKeys.includes(apiKey as string)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing API key'
        });
      }
    }

    // Add artificial delay if specified
    if (matchedEndpoint.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, matchedEndpoint.delay));
    }
    console.log('matchedEndpoint', matchedEndpoint);
    // Generate mock data
    const data = DataGenerator.generate(matchedEndpoint.schemaDefinition, matchedEndpoint.responseType === 'single' ? 1 : matchedEndpoint.count);
    // For single response type, ensure path parameters are included in the response
    if (matchedEndpoint.responseType === 'single' && Object.keys(matchedParams).length > 0) {
      console.log('matchedParams', matchedParams);
      const schema = matchedEndpoint.schemaDefinition;
      const singleData = Array.isArray(data) ? data[0] : data;
      // Add path parameters to the response data
      Object.entries(matchedParams).forEach(([paramName, paramValue]) => {
        console.log('schema', schema);
        console.log('schema.properties', schema.properties);
        if (schema && typeof schema === 'object') {
          const paramSchema = schema[paramName];
          console.log('paramSchema', paramSchema);
          (singleData as Record<string, unknown>)[paramName] = paramValue;
        }
      });

      // Handle pagination if supported
      if (matchedEndpoint.supportPagination) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedData = Array.isArray(data) ? data.slice(startIndex, endIndex) : data;
        
        return res.json({
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: Array.isArray(data) ? data.length : 1
          }
        });
      }
      console.log("singleData", singleData);
      return res.json(singleData);
    }

    res.json(data);
  } catch (err) {
    console.error('Error in mock API:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

export default router;
