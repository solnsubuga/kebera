# The web app: built once with Node, then served by nginx, which also passes /api/ to the API.
#   docker build -t kebera-web frontend
FROM node:25-alpine AS build
WORKDIR /web
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
# Where nginx finds the API (the compose service by default).
ENV KEBERA_API_URL=http://api:8000
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
