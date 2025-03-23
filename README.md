# Resto - Dynamic REST API Platform

Resto is a modern web application that allows you to create and manage dynamic REST API endpoints with customizable schemas and responses.

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the GPL-3.0 License.