#!/bin/bash

set -e

BRANCH="SEOBugsFixed"

echo "Fetching latest code from $BRANCH..."
git fetch origin

echo "Checking out $BRANCH..."
git checkout $BRANCH

echo "Resetting to origin/$BRANCH..."
git reset --hard origin/$BRANCH

echo "Cleaning untracked files..."
# Keep important runtime files/folders
git clean -fd \
  -e deploy.sh \
  -e .env \
  -e server/.env \
  -e uploads \
  -e dist/public/googlee3753bcddcf603d2.html

echo "Installing root dependencies..."
pnpm install --frozen-lockfile

echo "Installing server dependencies..."
pnpm --dir server install --frozen-lockfile

echo "Migrate new tables"
pnpm db:push
echo "Building project..."
pnpm build

echo "Restarting PM2..."
pm2 restart rayhana --update-env || \
pm2 start pnpm --name rayhana -- run start

echo "Deployment completed successfully 🚀"