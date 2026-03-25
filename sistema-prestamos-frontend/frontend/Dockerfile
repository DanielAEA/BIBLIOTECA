# ============================================
# Etapa 1: Compilar la aplicación Angular
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias primero (para cachear npm install)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación para producción
RUN npm run build -- --configuration=production

# ============================================
# Etapa 2: Servir con Nginx
# ============================================
FROM nginx:alpine

# Eliminar configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular
COPY --from=build /app/dist/sistema-prestamos-frontend /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
