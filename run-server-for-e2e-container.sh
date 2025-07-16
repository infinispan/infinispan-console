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
SERVER_IMAGE_URL_DIFF_VERSION="quay.io/infinispan/server:16.0.0.Dev02-1"

$DOCKER_COMMAND pull ${SERVER_IMAGE_URL}
$DOCKER_COMMAND run --name ispn-lon -d -p 11222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v ${ABSOLUTE_PATH}/scripts/e2eTestsConfigLON.xml:/user-config/e2eTestsConfigLON.xml -e JAVA_OPTIONS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m -Dinfinispan.site.name=LON -Djgroups.mcast_port=46656" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL} --node-name=infinispan-4-lon-e2e -c infinispan-xsite.xml -c "/user-config/e2eTestsConfigLON.xml"
$DOCKER_COMMAND run --name ispn-nyc -d -p 31222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v ${ABSOLUTE_PATH}/scripts/e2eTestsConfigNYC.xml:/user-config/e2eTestsConfigNYC.xml -e JAVA_OPTIONS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m -Dinfinispan.site.name=NYC -Djgroups.mcast_port=46666" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL} --node-name=infinispan-4-nyc-e2e -c infinispan-xsite.xml -c "/user-config/e2eTestsConfigNYC.xml"
$DOCKER_COMMAND run --name ispn-nyc-1 -d -p 51222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v ${ABSOLUTE_PATH}/scripts/e2eTestsConfigNYC.xml:/user-config/e2eTestsConfigNYC.xml -e JAVA_OPTIONS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m -Dinfinispan.site.name=NYC -Djgroups.mcast_port=46666" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL_DIFF_VERSION} --node-name=infinispan-4-nyc-1-e2e -c infinispan-xsite.xml -c "/user-config/e2eTestsConfigNYC.xml"
$DOCKER_COMMAND run --name ispn-local -d -p 41222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v ${ABSOLUTE_PATH}/scripts/infinispan-local.xml:/user-config/infinispan-local.xml -e JAVA_OPTIONS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL} --node-name=infinispan-4-local-e2e -c "/user-config/infinispan-local.xml"

#Adding nashorn libraries to both containers
for containerId in $($DOCKER_COMMAND ps -q)
do
  $DOCKER_COMMAND exec -it $containerId /opt/infinispan/bin/cli.sh install org.openjdk.nashorn:nashorn-core:15.6
  $DOCKER_COMMAND exec -it $containerId /opt/infinispan/bin/cli.sh install org.ow2.asm:asm:9.4
  $DOCKER_COMMAND exec -it $containerId /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-commons:9.4
  $DOCKER_COMMAND exec -it $containerId /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-tree:9.4
  $DOCKER_COMMAND exec -it $containerId /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-util:9.4
done

#Restarting containers
$DOCKER_COMMAND restart $($DOCKER_COMMAND ps -q)

sleep 20
#Creating data
cd data; bash ./create-data.sh admin password
