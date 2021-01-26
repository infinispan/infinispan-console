#!/usr/bin/env bash

set -e

if [[ $1 = "--ci" ]]; then
  echo "Launch script finished"
else
  trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
fi


SERVER_VERSION="12.0.0.Final"
SERVER_HOME=server/infinispan-server-$SERVER_VERSION
CLUSTER_SIZE_MAIN="$SERVER_HOME/bin/cli.sh -c localhost:11322 -f batch "
ZIP_ROOT="http://downloads.jboss.org/infinispan"

CONF_DIR_TO_COPY_FROM="scripts/"
IS_SSL_PROCESSED=0
SERVER_DIR="infinispan-server"

function prepareServerDir()
{
    local isCi=$1
    local confPath=$2
    local dirName=${3}

    if [ ! -f server/infinispan-server-$SERVER_VERSION.zip ]; then
        cd server
        wget $ZIP_ROOT/$SERVER_VERSION/infinispan-server-$SERVER_VERSION.zip
        unzip  infinispan-server-$SERVER_VERSION.zip
        cd ..
    fi

    if [[ -z "${SERVER_TMP}" ]]; then
         SERVER_TMP=server/${SERVER_DIR}
         mkdir ${SERVER_TMP} 2>/dev/null
         echo "Created temporary directory: $SERVER_TMP"

         cp -r ${SERVER_HOME}/* $SERVER_TMP
         echo "Server copied to temporary directory."
    fi

    cp -r ${SERVER_HOME}/server ${SERVER_TMP}/${dirName}


    cp "${CONF_DIR_TO_COPY_FROM}/${confPath}" ${SERVER_TMP}/${dirName}/conf
    echo "Infinispan configuration file ${confPath} copied to server ${dirName}."

    export SERVER_TMP=${SERVER_TMP}
}

function startServer()
{
    local isCi=$1
    local confPath=$2
    local port=${3}
    local nodeName=${4}
    local jvmParam=${5}

    prepareServerDir "${isCi}" ${confPath} ${nodeName}

    if [[ ! -z ${port} ]]; then
        portStr="-p ${port}"
    fi


    if [[ ${isCi} = "--ci" ]]; then
      nohup $SERVER_TMP/bin/server.sh -Djavax.net.debug -Dorg.infinispan.openssl=false -c ${confPath} -s ${SERVER_TMP}/${nodeName} ${portStr:-""} --node-name=${nodeName} ${jvmParam:-} &
    else
      ${SERVER_TMP}/bin/server.sh -Djavax.net.debug -Dorg.infinispan.openssl=false -c ${confPath} -s ${SERVER_TMP}/${nodeName} ${portStr:-} --node-name=${nodeName} ${jvmParam:-} &
    fi
}

#deleting the testable server directory
rm -drf server/${SERVER_DIR}

export JAVA_OPTS="-Xms512m -Xmx1024m -XX:MetaspaceSize=128M -XX:MaxMetaspaceSize=512m"

startServer "$1" infinispan-no-secured.xml 11222 infinispan-4-e2e
echo "Infinispan Server for E2E tests has started."


if [[ $1 = "--ci" ]]; then
  echo "Launch script finished"
else
  # Wait until script stopped
  while :
  do
    sleep 5
  done
fi
