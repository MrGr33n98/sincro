# --- Estágio de Build ---
FROM node:22-alpine AS build

# Instala dependências nativas comuns para Alpine
RUN apk add --no-cache libc6-compat g++ make python3

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos relevantes do frontend
COPY package.json tsconfig*.json vite.config.ts ./

# Tenta copiar dependências do workspace se estiverem no build context
# IMPORTANTE: Se o build context for restrito, você precisará instalar apenas
# as dependências deste subprojeto ou alterar o build context no compose.
COPY src ./src
COPY public ./public
COPY index.html ./

# Build da aplicação Vite
RUN npm install
RUN npm run build

# --- Estágio de Produção ---
FROM node:22-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build (aqui é /app/dist já que no WORKDIR /app acima nós rodamos npm run build)
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]