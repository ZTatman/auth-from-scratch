FROM node:20-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Copy Prisma schema before installing dependencies
# This is needed because npm postinstall runs prisma generate
COPY server/prisma ./server/prisma

# Install dependencies (this will run prisma generate via postinstall)
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the application in development mode
CMD ["npm", "run", "dev", "--workspace", "server"]

