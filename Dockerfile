FROM node:9-alpine
ADD . /src

RUN npm i -g npm@latest

RUN apk update && apk add bash && \
    cd /src; npm install && \
    ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime
    
EXPOSE  3000
CMD node /src/bin/www
