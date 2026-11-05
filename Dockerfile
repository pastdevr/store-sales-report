FROM node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/host/package.json apps/host/package.json
COPY apps/store-sales-report/package.json apps/store-sales-report/package.json
COPY packages/store-sales-api/package.json packages/store-sales-api/package.json
RUN npm ci

COPY . .

FROM build AS build-remote
RUN npm run build:remote

FROM build-remote AS build-host
ARG VITE_STORE_SALES_REMOTE_ENTRY=http://localhost:8081/mf-manifest.json
ENV VITE_STORE_SALES_REMOTE_ENTRY=${VITE_STORE_SALES_REMOTE_ENTRY}
ENV VITE_ENABLE_MOCK_API=true
RUN npm run build:host

FROM nginx:1.27-alpine AS host
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-host /workspace/apps/host/dist /usr/share/nginx/html

FROM nginx:1.27-alpine AS remote
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-remote /workspace/apps/store-sales-report/dist /usr/share/nginx/html
