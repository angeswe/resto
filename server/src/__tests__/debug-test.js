const supertest = require('supertest');
const express = require('express');
const { projectRoutes } = require('../routes/projects');

// Create a test app with the project routes
const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in test:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

async function testInvalidId() {
  const response = await supertest(app).delete('/api/projects/invalid-id');
  console.log('Status code:', response.status);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
}

testInvalidId().catch(console.error);
