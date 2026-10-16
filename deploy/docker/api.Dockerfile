FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --workspace=apps/api --include-workspace-root=false --no-audit --no-fund

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3002
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/src ./apps/api/src
COPY apps/api/sql ./apps/api/sql
COPY apps/api/data ./apps/api/data
COPY apps/web/src/assets/images ./apps/web/src/assets/images
RUN mkdir -p /app/apps/api/uploads && chown node:node /app/apps/api/uploads
WORKDIR /app/apps/api
USER node
EXPOSE 3002
CMD ["node", "src/server.js"]
