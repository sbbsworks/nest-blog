#!/bin/sh
PATH=/usr/sbin:/sbin:/usr/bin:/bin
export PATH="$PATH:"/usr/local/bin/

## containers/users/.env.sample
## containers/notifier/.env.sample
## containers/blog/.env.sample
## containers/rmq/.env.sample
## apps/gateway/src/app/jwt/.env.sample

# .env.development
# .env.production

if [ -e ${PWD}/containers/users/.env ]
then
    echo "${PWD}/containers/users/.env exists"
else
    cp ${PWD}/containers/users/.env.sample ${PWD}/containers/users/.env
    echo "${PWD}/containers/users/.env created"
fi

if [ -e ${PWD}/containers/rmq/.env ]
then
    echo "${PWD}/containers/rmq/.env exists"
else
    cp ${PWD}/containers/rmq/.env.sample ${PWD}/containers/rmq/.env
    echo "${PWD}/containers/rmq/.env created"
fi

if [ -e ${PWD}/containers/notifier/.env ]
then
    echo "${PWD}/containers/notifier/.env exists"
else
    cp ${PWD}/containers/notifier/.env.sample ${PWD}/containers/notifier/.env
    echo "${PWD}/containers/notifier/.env created"
fi

if [ -e ${PWD}/containers/blog/.env ]
then
    echo "${PWD}/containers/blog/.env exists"
else
    cp ${PWD}/containers/blog/.env.sample ${PWD}/containers/blog/.env
    echo "${PWD}/containers/blog/.env created"
fi

if [ -e ${PWD}/apps/gateway/src/app/jwt/.env ]
then
    echo "${PWD}/apps/gateway/src/app/jwt/.env exists"
else
    cp ${PWD}/apps/gateway/src/app/jwt/.env.sample ${PWD}/apps/gateway/src/app/jwt/.env
    echo "${PWD}/apps/gateway/src/app/jwt/.env created"
fi

docker compose -f ${PWD}/containers/blog/docker-compose.yaml up -d &&
docker compose -f ${PWD}/containers/users/docker-compose.yaml up -d &&
docker compose -f ${PWD}/containers/rmq/docker-compose.yaml up -d &&
docker compose -f ${PWD}/containers/notifier/docker-compose.yaml up
