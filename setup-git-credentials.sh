#!/bin/bash
# Script to securely add GitHub credentials
# This will prompt you for your GitHub username and token

echo "Enter your GitHub username:"
read GITHUB_USERNAME

echo "Enter your fine-grained personal access token:"
read -s GITHUB_TOKEN

# Add credentials to git credential store
echo "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com" | git credential approve

echo "Credentials stored successfully!"
echo "You can now push to GitHub with: git push -u origin main"


