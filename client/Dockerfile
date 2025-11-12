FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on
EXPOSE 3000

# Start the development server
# Use --host to make Vite accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]

