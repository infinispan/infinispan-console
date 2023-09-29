#!/usr/bin/env bash

set -e

echo "Building console."
npm run build

echo  "Starting docker containers"
cd scripts/docker-compose
docker-compose up &

# Wait for server to startup
curl --fail --silent --show-error --retry-all-errors --retry 240 --retry-delay 1 http://localhost:11222/rest/v2/cache-managers/default/health/status > /dev/null
curl --fail --silent --show-error --retry-all-errors --retry 240 --retry-delay 1 http://localhost:31222/rest/v2/cache-managers/default/health/status > /dev/null

echo "Servers are ready."

echo "Creating data on the Server."
./create-xsite-data.sh

trap 'docker-compose down' EXIT

echo "Starting to run the tests."

npm run cy:run-xsite

echo "Test execution finished."