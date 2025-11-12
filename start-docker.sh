#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Auth App - Docker Compose Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose not found!${NC}"
    echo "Please install Docker Compose and try again."
    exit 1
fi

echo -e "${GREEN}✓ docker-compose is available${NC}"
echo ""

# Ask user if they want to rebuild
echo -e "${BLUE}Do you want to rebuild the images? (recommended for first run)${NC}"
read -p "Rebuild? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Building and starting services...${NC}"
    docker-compose up --build
else
    echo -e "${BLUE}Starting services...${NC}"
    docker-compose up
fi

# This will only execute if docker-compose exits
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Services stopped${NC}"
echo -e "${BLUE}========================================${NC}"

