#https://hub.docker.com/_/node?tab=tags&page=1
FROM node:20.11.0-alpine3.18

WORKDIR /usr/src/app


COPY package*.json ./
COPY tsconfig.json .

RUN npm install

COPY src ./src
