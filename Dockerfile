# Base Image
FROM node:18-alpine AS base
WORKDIR /app

RUN npm install -g pnpm@8
COPY pnpm-lock.yaml .

# Build Stage
FROM base AS build
RUN pnpm fetch

COPY . .
RUN pnpm install --offline
RUN pnpm build

# Deploy Stage
FROM base
RUN pnpm fetch --prod

COPY package.json .
RUN pnpm install --offline --prod

COPY --from=build /app/build ./build
COPY drizzle ./drizzle

EXPOSE 3000
ENV BODY_SIZE_LIMIT=Infinity

CMD ["node", "./build/index.js"]
