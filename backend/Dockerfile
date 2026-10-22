# Dockerfile para AWS App Runner
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto (App Runner usa 8080 por defecto, pero podemos usar 4000)
EXPOSE 8080

# Variables de entorno por defecto (se sobrescriben en App Runner)
ENV NODE_ENV=production
ENV PORT=8080

# Comando de inicio
CMD ["node", "src/server.js"]
