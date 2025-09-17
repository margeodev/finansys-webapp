# Etapa 1: Build Angular
FROM node:22.12.0 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli && npm install
COPY . .
RUN ng build --configuration production

# Etapa 2: Servir com Nginx
FROM nginx:stable-alpine
# Copiar build final (dentro de browser/) para o nginx
COPY --from=build /app/dist/finansys-webapp/browser /usr/share/nginx/html

# Copiar configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
