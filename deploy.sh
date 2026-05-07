#!/bin/bash
set -e

echo "Fetching latest code..."
git fetch origin

echo "Resetting to origin/master..."
git reset --hard origin/master

echo "Cleaning untracked files..."
# keep both env files
git clean -fd -e deploy.sh -e .env -e server/.env -e uploads -e dist/public/googlee3753bcddcf603d2.html


echo "Installing dependencies..."
pnpm install --frozen-lockfile
pnpm --dir server install --frozen-lockfile

echo "Building project..."
pnpm build

echo "Restarting PM2 with production env..."
pm2 restart rayhana --update-env || pm2 start pnpm --name rayhana -- run start \
  --update-env

echo "Deployment completed successfully 🚀"
