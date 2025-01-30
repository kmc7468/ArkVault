# Base Image
FROM node:22-alpine AS base
WORKDIR /app

RUN apk add --no-cache bash curl && \
    curl -o /usr/local/bin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it

RUN npm install -g pnpm@9
COPY pnpm-lock.yaml .

# Build Stage
FROM base AS build
RUN pnpm fetch

COPY . .
RUN pnpm install --offline && \
    pnpm build && \
    sed -i "s/http\.createServer()/http.createServer({ requestTimeout: 0 })/g" ./build/index.js

# Deploy Stage
FROM base
RUN pnpm fetch --prod

COPY package.json .
RUN pnpm install --offline --prod

COPY --from=build /app/build ./build

EXPOSE 3000
ENV BODY_SIZE_LIMIT=Infinity
CMD ["bash", "-c", "wait-for-it ${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432} -- node ./build/index.js"]
