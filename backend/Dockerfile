FROM node:24-alpine AS builder

WORKDIR /app


# copy shared types
COPY shared/ ./shared/

# copy backend files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/tsconfig.build.json ./backend/
COPY backend/nest-cli.json ./backend/

COPY backend/src/ ./backend/src/
COPY backend/prisma/ ./backend/prisma/

WORKDIR /app/backend

RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/generated ./generated
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package*.json ./

COPY backend/prisma.config.ts ./prisma.config.ts

RUN npm ci --only=production

RUN chown -R nodeapp:nodejs /app

USER nodeapp

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/backend/src/main"]
