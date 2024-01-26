#!/bin/sh
PATH=/usr/sbin:/sbin:/usr/bin:/bin
export PATH="$PATH:"/usr/local/bin/

if [ -e ${PWD}/.env.production ]
then
    cp ${PWD}/.env.production ${PWD}/containers/server/.env
    echo "${PWD}/containers/server/.env created"
else
    echo "${PWD}/.env.production DOES NOT EXIST, EXIT"
    exit
fi

if [ -e ${PWD}/dist/apps ]
then
    echo "${PWD}/dist/apps exists"
else
    echo "${PWD}/dist/apps DOES NOT EXIST, EXIT"
    exit
fi

if [ -e ${PWD}/containers/server/apps ]
then
    echo "${PWD}/containers/server/apps exists"
else
    mkdir ${PWD}/containers/server/apps
    echo "${PWD}/containers/server/apps created"
fi

if [ -e ${PWD}/containers/server/apps/blog ]
then
    yes|cp -ruv ${PWD}/dist/apps/blog/* ${PWD}/containers/server/apps/blog/ 2>/dev/null
else
    mkdir ${PWD}/containers/server/apps/blog
    yes|cp -ruv ${PWD}/dist/apps/blog/* ${PWD}/containers/server/apps/blog/ 2>/dev/null
fi

if [ -e ${PWD}/containers/server/apps/gateway ]
then
    yes|cp -ruv ${PWD}/dist/apps/gateway/* ${PWD}/containers/server/apps/gateway/ 2>/dev/null
else
    mkdir ${PWD}/containers/server/apps/gateway
    yes|cp -ruv ${PWD}/dist/apps/gateway/* ${PWD}/containers/server/apps/gateway/ 2>/dev/null
fi

if [ -e ${PWD}/containers/server/apps/notifier ]
then
    yes|cp -ruv ${PWD}/dist/apps/notifier/* ${PWD}/containers/server/apps/notifier/ 2>/dev/null
else
    mkdir ${PWD}/containers/server/apps/notifier
    yes|cp -ruv ${PWD}/dist/apps/notifier/* ${PWD}/containers/server/apps/notifier/ 2>/dev/null
fi

if [ -e ${PWD}/containers/server/apps/users ]
then
    yes|cp -ruv ${PWD}/dist/apps/users/* ${PWD}/containers/server/apps/users/ 2>/dev/null
else
    mkdir ${PWD}/containers/server/apps/users
    yes|cp -ruv ${PWD}/dist/apps/users/* ${PWD}/containers/server/apps/users/ 2>/dev/null
fi

cat ${PWD}/containers/users/.env ${PWD}/containers/notifier/.env ${PWD}/containers/blog/.env ${PWD}/containers/rmq/.env ${PWD}/apps/gateway/src/app/jwt/.env ${PWD}/.env.production > ${PWD}/containers/server/apps/.env.production
cp -r ${PWD}/node_modules/@prisma-blog ${PWD}/containers/server/apps/@prisma-blog
cp -r ${PWD}/containers/server/entrypoint.sh ${PWD}/containers/server/apps/entrypoint.sh

docker compose -f ${PWD}/containers/server/docker-compose.yaml stop
docker compose -f ${PWD}/containers/server/docker-compose.yaml build
docker compose -f ${PWD}/containers/server/docker-compose.yaml up -d
