#!/bin/bash
# GitHub Repository Setup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Polygon Clipping Visualization - GitHub Setup${NC}"
echo "This script will help you set up your GitHub repository."
echo ""

# Confirm user wants to proceed
read -p "Do you want to proceed with GitHub setup? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Setup aborted."
  exit 0
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
  echo -e "${RED}Error: GitHub username cannot be empty${NC}"
  exit 1
fi

# Get repository name
read -p "Enter repository name (default: polygon-clipping-visualization): " REPO_NAME
REPO_NAME=${REPO_NAME:-polygon-clipping-visualization}

echo -e "\n${GREEN}Setting up Git repository...${NC}"

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
  git init
  echo "Git repository initialized."
else
  echo "Git repository already exists."
fi

# Check if remote origin exists
if git remote | grep -q "origin"; then
  echo "Remote 'origin' already exists. Updating URL..."
  git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
else
  echo "Adding remote 'origin'..."
  git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# Stage all files
git add .

echo -e "\n${GREEN}Ready to commit! Run the following commands:${NC}"
echo -e "${BLUE}git commit -m 'Initial commit'${NC}"
echo -e "${BLUE}git branch -M main${NC}"
echo -e "${BLUE}git push -u origin main${NC}"

echo -e "\n${GREEN}Remember to create the repository '$REPO_NAME' on GitHub first!${NC}"
echo -e "Visit: https://github.com/new"
echo -e "\nRepository URL will be: https://github.com/$GITHUB_USERNAME/$REPO_NAME"