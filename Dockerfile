# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@8

COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .
RUN pnpm install --offline
RUN pnpm build

# Deploy Stage
FROM node:18-alpine
WORKDIR /app

RUN npm install -g pnpm@8

COPY pnpm-lock.yaml .
RUN pnpm fetch --prod

COPY package.json .
RUN pnpm install --offline --prod

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "./build/index.js"]
