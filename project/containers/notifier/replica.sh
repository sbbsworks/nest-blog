#!/bin/bash
set -o allexport
source ${PWD}/.env set
+o allexport

mongosh --host $NOTIFIER_INITDB_CONTAINER1 --port $NOTIFIER_INITDB_PORT --eval 'rs.initiate({_id : "rs0", members: [{ _id: 0, host: "'$NOTIFIER_INITDB_CONTAINER1':'$NOTIFIER_INITDB_PORT'" },{ _id: 1, host: "'$NOTIFIER_INITDB_CONTAINER2':'$NOTIFIER_INITDB_PORT'" },]}); rs.secondaryOk(true);'

exit
