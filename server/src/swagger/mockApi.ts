/**
 * @swagger
 * tags:
 *   name: Mock API
 *   description: Mock API endpoints for testing
 */

/**
 * @swagger
 * /mock/debug:
 *   get:
 *     summary: Get debug information about available endpoints
 *     tags: [Mock API]
 *     responses:
 *       200:
 *         description: Debug information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 endpointCount:
 *                   type: integer
 *                   description: Number of available endpoints
 *                 endpoints:
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
 *                 error:
 *                   type: string
 *                   example: Bad Request
 */

/**
 * @swagger
 * /mock/{path}:
 *   get:
 *     summary: Dynamic mock endpoint for GET requests
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the endpoint
 *     responses:
 *       200:
 *         description: Mock response
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                 - type: array
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Endpoint not found
 *   post:
 *     summary: Dynamic mock endpoint for POST requests
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the endpoint
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mock response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Endpoint not found
 *   put:
 *     summary: Dynamic mock endpoint for PUT requests
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the endpoint
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mock response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Endpoint not found
 *   delete:
 *     summary: Dynamic mock endpoint for DELETE requests
 *     tags: [Mock API]
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the endpoint
 *     responses:
 *       200:
 *         description: Mock response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       204:
 *         description: No Content
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Endpoint not found
 */

export {};
