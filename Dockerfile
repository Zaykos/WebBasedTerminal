# Build stage
FROM node:lts-alpine3.13 as builder
WORKDIR /src
COPY package*.json ./
RUN npm install

# Application stage
FROM node:lts-alpine3.13
WORKDIR /app
COPY --from=builder /src/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "/app/bin/www"]
