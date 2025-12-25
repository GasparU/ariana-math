# syntax = docker/dockerfile:1

# Usamos una versión estable de Node
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

# Directorio de trabajo
WORKDIR /app

# Etapa de construcción
FROM base AS build

# Copiamos archivos de dependencias
# Usamos comodín para que no falle si falta el .lock
COPY package*.json ./

# Instalamos dependencias (usamos install en vez de ci para mayor flexibilidad en deploy)
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación NestJS
RUN npm run build

# Etapa final
FROM base

# Copiamos solo lo necesario desde el build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Exponemos el puerto 3000
EXPOSE 3000

# Comando de inicio directo al archivo compilado
CMD [ "node", "dist/main" ]