FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY bloodbank-frontend/package*.json ./
RUN npm install

COPY bloodbank-frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
