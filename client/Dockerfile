FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build Tailwind CSS first
RUN npx tailwindcss -i ./src/index.css -o ./src/styles/tailwind.css

# Then build the project
RUN npm run build

FROM nginx:alpine

# Copy the built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy env setup script
COPY docker-entrypoint.sh /docker-entrypoint.d/env.sh
RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
