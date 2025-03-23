dynamic-rest-api/
├── client/ # Frontend React application
│ ├── public/
│ │ ├── index.html
│ │ ├── favicon.ico
│ │ └── ...
│ ├── src/
│ │ ├── components/
│ │ │ ├── common/
│ │ │ │ ├── Header.jsx
│ │ │ │ ├── Footer.jsx
│ │ │ │ └── Loading.jsx
│ │ │ ├── projects/
│ │ │ │ ├── ProjectList.jsx
│ │ │ │ ├── ProjectCard.jsx
│ │ │ │ └── ProjectForm.jsx
│ │ │ ├── endpoints/
│ │ │ │ ├── EndpointList.jsx
│ │ │ │ ├── EndpointForm.jsx
│ │ │ │ └── EndpointModal.jsx
│ │ │ ├── docs/
│ │ │ │ ├── ApiDocumentation.jsx
│ │ │ │ ├── EndpointDocs.jsx
│ │ │ │ └── CodeExamples.jsx
│ │ │ ├── Home.jsx
│ │ │ ├── ProjectCreation.jsx
│ │ │ └── ProjectSettings.jsx
│ │ ├── utils/
│ │ │ ├── api.js
│ │ │ └── helpers.js
│ │ ├── contexts/
│ │ │ └── AppContext.jsx
│ │ ├── styles/
│ │ │ └── tailwind.css
│ │ ├── App.jsx
│ │ ├── index.jsx
│ │ └── setupProxy.js
│ ├── package.json
│ ├── tailwind.config.js
│ └── README.md
│
├── server/ # Backend Node.js application
│ ├── config/
│ │ ├── db.js # Database configuration
│ │ └── default.js # App configuration
│ ├── controllers/
│ │ ├── projectController.js
│ │ ├── endpointController.js
│ │ └── mockApiController.js
│ ├── models/
│ │ ├── Project.js
│ │ └── Endpoint.js
│ ├── routes/
│ │ ├── api/
│ │ │ ├── projects.js
│ │ │ └── endpoints.js
│ │ └── mockApi.js
│ ├── utils/
│ │ ├── randomGenerator.js
│ │ └── responseFormatter.js
│ ├── middleware/
│ │ └── auth.js
│ ├── server.js
│ ├── package.json
│ └── README.md
│
├── package.json # Root package.json for scripts
├── .gitignore
├── README.md
└── docker-compose.yml # Optional for containerized deployment
