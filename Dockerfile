FROM node:lts-alpine3.13
ADD . /src

RUN apk upgrade && apk update && apk add bash python3 gcc g++ make && \
    cd /src; npm install && \
    ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime 


EXPOSE 3000

CMD node /src/bin/www
