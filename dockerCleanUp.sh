#!/bin/bash 

docker-compose down

docker system prune -a 

docker rm -f $(docker ps -a -q)

docker volume rm $(docker volume ls -q)

docker network rm $(docker network ls -q)

#docker-compose up -d 
