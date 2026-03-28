# ═══════════════════════════════════════════════════════════════════
# Sincronia Frontend — Dockerfile (React + Vite)
# ═══════════════════════════════════════════════════════════════════

# --- Estágio de Build ---
FROM node:22-alpine AS build

# Instala dependências nativas comuns para Alpine
RUN apk add --no-cache libc6-compat g++ make python3

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos do frontend
COPY package.json pnpm-lock.yaml* ./

# Instala dependências
RUN pnpm install --frozen-lockfile || pnpm install

# Copia código fonte
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig.json ./

# Build da aplicação Vite
RUN pnpm run build

# --- Estágio de Produção ---
FROM node:22-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
