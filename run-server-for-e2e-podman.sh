#!/usr/bin/env bash
set -e

ABSOLUTE_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo ${ABSOLUTE_PATH}
SERVER_IMAGE_URL="${SERVER_IMAGE_URL:-quay.io/infinispan-test/server:main}"

podman pull ${SERVER_IMAGE_URL}
podman run -d -p 11222:11222 -v ${ABSOLUTE_PATH}/scripts/identities.batch:/user-config/identities.batch -v  ${ABSOLUTE_PATH}/dist:/opt/infinispan/static/console -v  ${ABSOLUTE_PATH}/scripts/infinispan-basic-auth.xml:/opt/infinispan/server/conf/infinispan.xml -e JAVA_OPTIONS="-Xms1024m -Xmx3072m -XX:MetaspaceSize=1024m -XX:MaxMetaspaceSize=2048m" -e IDENTITIES_BATCH="/user-config/identities.batch" ${SERVER_IMAGE_URL} --node-name=infinispan-4-e2e
#podman exec $(podman ps -q ) /opt/infinispan/bin/cli.sh install org.openjdk.nashorn:nashorn-core:15.4
#podman exec $(podman ps -q ) /opt/infinispan/bin/cli.sh install org.ow2.asm:asm:9.4
#podman exec $(podman ps -q ) /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-commons:9.4
#podman exec $(podman ps -q ) /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-tree:9.4
#podman exec $(podman ps -q ) /opt/infinispan/bin/cli.sh install org.ow2.asm:asm-util:9.4

#podman restart $(podman ps -q )

sleep 20
cd data; bash ./create-data.sh admin password
