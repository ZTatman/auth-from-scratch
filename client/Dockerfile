FROM node:20-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Copy Prisma schema before installing dependencies
# This is needed because server postinstall runs prisma generate
COPY server/prisma ./server/prisma

# Install dependencies for all workspaces
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on
EXPOSE 3000

# Start the development server
# Use --host to make Vite accessible from outside the container
CMD ["npm", "run", "dev", "--workspace=client", "--", "--host"]
