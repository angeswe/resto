/**
 * @swagger
 * components:
 *   schemas:
 *     Endpoint:
 *       type: object
 *       required:
 *         - path
 *         - method
 *         - projectId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the endpoint
 *         path:
 *           type: string
 *           description: The path of the endpoint
 *         method:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *           description: The HTTP method of the endpoint
 *         projectId:
 *           type: string
 *           description: The ID of the project this endpoint belongs to
 *         response:
 *           type: string
 *           description: The response template
 *         schemaDefinition:
 *           type: object
 *           description: The schema definition for generating data
 *         count:
 *           type: integer
 *           description: Number of items to generate
 *         requireAuth:
 *           type: boolean
 *           description: Whether authentication is required
 *         apiKeys:
 *           type: array
 *           items:
 *             type: string
 *           description: List of API keys
 *         delay:
 *           type: integer
 *           description: Response delay in milliseconds
 *         responseType:
 *           type: string
 *           enum: [list, single]
 *           description: Response type (list or single item)
 *         parameterPath:
 *           type: string
 *           description: Path for parameter
 *         responseHttpStatus:
 *           type: integer
 *           description: HTTP status code for the response
 */

/**
 * @swagger
 * /api/projects/{projectId}/endpoints:
 *   get:
 *     summary: Get all endpoints for a project
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     responses:
 *       200:
 *         description: List of endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid project ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid project ID
 */

/**
 * @swagger
 * /api/projects/{projectId}/endpoints:
 *   post:
 *     summary: Create a new endpoint for a project
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - method
 *             properties:
 *               path:
 *                 type: string
 *                 description: The path of the endpoint
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 description: The HTTP method of the endpoint
 *               response:
 *                 type: string
 *                 description: The response template
 *               schemaDefinition:
 *                 type: object
 *                 description: The schema definition for generating data
 *               count:
 *                 type: integer
 *                 description: Number of items to generate
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *               delay:
 *                 type: integer
 *                 description: Response delay in milliseconds
 *               responseType:
 *                 type: string
 *                 enum: [list, single]
 *                 description: Response type (list or single item)
 *               parameterPath:
 *                 type: string
 *                 description: Path for parameter
 *     responses:
 *       201:
 *         description: Endpoint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid request
 */

/**
 * @swagger
 * /api/projects/{projectId}/endpoints/{endpointId}:
 *   get:
 *     summary: Get a specific endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *       - in: path
 *         name: endpointId
 *         schema:
 *           type: string
 *         required: true
 *         description: The endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid ID
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Endpoint not found
 */

/**
 * @swagger
 * /api/endpoints/{endpointId}:
 *   put:
 *     summary: Update an endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: endpointId
 *         schema:
 *           type: string
 *         required: true
 *         description: The endpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 description: The path of the endpoint
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 description: The HTTP method of the endpoint
 *               response:
 *                 type: string
 *                 description: The response template
 *               schemaDefinition:
 *                 type: object
 *                 description: The schema definition for generating data
 *               count:
 *                 type: integer
 *                 description: Number of items to generate
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *               delay:
 *                 type: integer
 *                 description: Response delay in milliseconds
 *               responseType:
 *                 type: string
 *                 enum: [list, single]
 *                 description: Response type (list or single item)
 *               parameterPath:
 *                 type: string
 *                 description: Path for parameter
 *     responses:
 *       200:
 *         description: Endpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid request
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Endpoint not found
 */

/**
 * @swagger
 * /api/endpoints/{endpointId}:
 *   delete:
 *     summary: Delete an endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: endpointId
 *         schema:
 *           type: string
 *         required: true
 *         description: The endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid endpoint ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid endpoint ID
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Endpoint not found
 */

export {};
