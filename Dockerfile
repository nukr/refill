FROM mhart/alpine-node:6.3.1
MAINTAINER nukr <nukrs.w@gmail.com>

# http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
COPY package.json /tmp/package.json
RUN cd /tmp && NODE_ENV=production npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY . /opt/app

# Run app
CMD ["./bin/run.sh"]
