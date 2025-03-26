# Resto - Dynamic REST API Platform

I found myself in need of a simple and effective way to create and manage test REST API endpoints for my projects.

Resto is a web application that allows you to create and manage dynamic REST API endpoints with customizable schemas and responses.

## Features

- Create and manage multiple API projects
- Define custom endpoints with dynamic response schemas
- Support for GET, POST, PUT, DELETE methods
- Authentication support for protected endpoints
- Real-time endpoint testing
- Dark/Light theme support
- Interactive API documentation

## Prerequisites

- Docker and Docker Compose
- Node.js 20.x (for local development)
- npm or yarn
- MongoDB

## Running with Docker (Recommended)

### Production Mode

1. Clone the repository:
```bash
git clone https://github.com/angeswe/resto.git
cd resto
```

2. Set up environment variables:
```bash
# Create a secure password for MongoDB
export MONGO_PASSWORD=your_secure_password
```

3. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost
- API: http://localhost/api

### Development Mode

For development with hot-reloading:

1. Install dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

The development servers will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3000

## Project Structure

```
resto/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── styles/
│   └── package.json
├── server/          # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
├── docker-compose.yml
└── package.json
```

## Environment Variables

### Server
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (production/development)

### Client
- `VITE_API_URL` - Backend API URL (development only)

### Docker
- `MONGO_PASSWORD` - MongoDB root password

## Using the Application

1. Access the application at http://localhost (or http://localhost:5173 in development mode)
2. You'll see a list of your API projects
3. Click on any project to view its endpoints
4. Click on an endpoint to view its detailed documentation, which includes:
   - API endpoint URL and method
   - Response status codes:
     - GET: 200 (OK), 206 (Partial Content), 304 (Not Modified), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable)
     - POST: 201 (Created), 202 (Accepted), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 409 (Conflict), 500 (Internal Server Error)
     - PUT: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error)
     - DELETE: 200 (OK), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
   - Request/response schema
   - Authentication requirements
   - Example requests and responses
   - Code examples in various programming languages

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the GPL-3.0 License.