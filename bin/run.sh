#!/bin/sh

if [ "$NODE_ENV" == production ]; then
  node dist/
else
  nodemon -x "babel-node src/"
fi
