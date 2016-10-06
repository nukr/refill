FROM mhart/alpine-node:6.3.1
MAINTAINER nukr <nukrs.w@gmail.com>

ENV DOCKERIZE_VERSION v0.2.0

COPY package.json /tmp/package.json
RUN apk add --no-cache curl \
  && cd /tmp && npm install \
  && mkdir -p /opt/app \
  && cp -a /tmp/node_modules /opt/app/ \
  && curl -L -q https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz -O \
  && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && apk del curl

WORKDIR /opt/app
COPY . /opt/app

# Run app
CMD ["./bin/run.sh"]
