# Usa una versión estable y ligera de Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de definición de dependencias
# Usamos comodín para package.json y lock si existe
COPY package*.json ./

# Instalamos TODAS las dependencias para poder compilar
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Construimos el proyecto (genera la carpeta dist)
RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# NestJS por defecto corre en el 3000, Railway/Fly lo mapean automáticamente
EXPOSE 3000

# Comando para arrancar en producción
CMD ["node", "dist/main"]