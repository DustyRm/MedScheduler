# ========= BASE DEV =========
FROM node:20-alpine AS dev
WORKDIR /app
EXPOSE 3000

COPY package*.json ./
RUN npm ci || npm install

CMD ["npm","run","dev"]

# ========= BUILD (PROD) =========
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========= RUNTIME (PROD) =========
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

CMD ["npm","run","start"]
