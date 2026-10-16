FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --no-audit --no-fund
COPY apps/web ./apps/web
ENV VITE_API_BASE_URL=""
RUN npm run build:web

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY deploy/docker/nginx-http.conf.template /opt/design-forge/nginx-http.conf.template
COPY deploy/docker/nginx-https.conf.template /opt/design-forge/nginx-https.conf.template
COPY deploy/docker/web-entrypoint.sh /opt/design-forge/web-entrypoint.sh
RUN chmod 0755 /opt/design-forge/web-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/bin/sh", "/opt/design-forge/web-entrypoint.sh"]
