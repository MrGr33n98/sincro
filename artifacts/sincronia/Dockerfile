# Use Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port 3000 for the Vite dev server
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]