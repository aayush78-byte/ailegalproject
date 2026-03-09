
# Use Node.js image
FROM node:20-slim AS build

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables for production build
# (VITE_API_URL should point to the backend service)
ENV VITE_API_URL=http://localhost:5000

# Build the app
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
