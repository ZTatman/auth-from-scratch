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

# Flags
CLEAN_VOLUMES=false
REBUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --clean)
      CLEAN_VOLUMES=true
      shift
      ;;
    --rebuild)
      REBUILD=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./start-docker.sh [--clean] [--rebuild]"
      echo "  --clean    Remove node_modules volumes before starting"
      echo "  --rebuild  Rebuild images before starting"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help to see available options."
      exit 1
      ;;
  esac
done

if [[ "$CLEAN_VOLUMES" == "true" ]]; then
  echo -e "${BLUE}Stopping services and removing volumes...${NC}"
  docker-compose down -v
  echo ""
else
  # Ask user if they want to clean node_modules volume
  echo -e "${BLUE}Do you want to clean the node_modules volume?${NC}"
  echo -e "${BLUE}Choose this if you added/updated dependencies and Docker keeps using stale node_modules.${NC}"
  read -p "Clean node_modules volume? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Stopping services and removing volumes...${NC}"
      docker-compose down -v
      echo ""
  fi
fi

if [[ "$REBUILD" == "true" ]]; then
  echo -e "${BLUE}Building and starting services...${NC}"
  docker-compose up --build
else
  # Ask user if they want to rebuild
  echo -e "${BLUE}Do you want to rebuild the images? (recommended after dependency changes)${NC}"
  read -p "Rebuild? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Building and starting services...${NC}"
      docker-compose up --build
  else
      echo -e "${BLUE}Starting services...${NC}"
      docker-compose up
  fi
fi

# This will only execute if docker-compose exits
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Services stopped${NC}"
echo -e "${BLUE}========================================${NC}"
