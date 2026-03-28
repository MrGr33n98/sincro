# ═══════════════════════════════════════════════════════════════════
# Sincronia Frontend — Dockerfile (React + Vite)
# Build a partir da raiz do workspace monorepo
# ═══════════════════════════════════════════════════════════════════

# --- Estágio de Build ---
FROM node:22-alpine AS build

# Instala dependências nativas comuns para Alpine
RUN apk add --no-cache libc6-compat g++ make python3

# Instala pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos da raiz para instalar dependências do workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copia o package.json do frontend
COPY artifacts/sincronia/package.json ./artifacts/sincronia/

# Instala dependências (apenas do frontend e suas dependências)
RUN pnpm install --filter "@workspace/sincronia..." --no-frozen-lockfile

# Copia o código fonte do frontend
COPY artifacts/sincronia/src ./artifacts/sincronia/src
COPY artifacts/sincronia/public ./artifacts/sincronia/public
COPY artifacts/sincronia/index.html ./artifacts/sincronia/
COPY artifacts/sincronia/vite.config.ts ./artifacts/sincronia/
COPY artifacts/sincronia/tsconfig.json ./artifacts/sincronia/

# Build da aplicação Vite
WORKDIR /app/artifacts/sincronia
RUN pnpm run build

# --- Estágio de Produção ---
FROM node:22-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build
COPY --from=build /app/artifacts/sincronia/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
