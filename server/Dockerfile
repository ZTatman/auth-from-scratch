FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before installing dependencies
# This is needed because npm postinstall runs prisma generate
COPY prisma ./prisma

# Install dependencies (this will run prisma generate via postinstall)
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the application in development mode
CMD ["npm", "run", "dev"]

