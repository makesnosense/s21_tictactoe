FROM node:24-alpine AS builder

WORKDIR /app

# copy shared types
COPY shared/ ./shared/

# copy frontend files
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next.config.mjs ./frontend/
COPY frontend/postcss.config.mjs ./frontend/
COPY frontend/src/ ./frontend/src/
COPY frontend/public/ ./frontend/public/

WORKDIR /app/frontend

RUN npm ci
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# copy built artifacts and necessary files
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/next.config.mjs ./

RUN npm ci --only=production

RUN chown -R nodeapp:nodejs /app

USER nodeapp

CMD ["npm", "start"]
