#!/bin/bash
if command -v docker &> /dev/null; then
    echo "Using Docker"
    DOCKER_COMMAND="docker"
else
    echo "Docker not found, using Podman"
    DOCKER_COMMAND="podman"
fi

ABSOLUTE_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo ${ABSOLUTE_PATH}
SERVER_IMAGE_URL="${SERVER_IMAGE_URL:-quay.io/infinispan-test/server:main}"

docker stop $(docker ps -aqf "name=ispn-nyc-1")
docker rm $(docker ps -aqf "name=ispn-nyc-1")

$DOCKER_COMMAND pull ${SERVER_IMAGE_URL}
$DOCKER_COMMAND run --name ispn-nyc-1 -d -p 51222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v ${ABSOLUTE_PATH}/scripts/e2eTestsConfigNYC.xml:/user-config/e2eTestsConfigNYC.xml -e JAVA_OPTS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m -Dinfinispan.site.name=NYC -Djgroups.mcast_port=46666" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL} --node-name=infinispan-4-nyc-1-e2e -c infinispan-xsite.xml -c "/user-config/e2eTestsConfigNYC.xml"

echo "The container was restarted."
exit 0;
