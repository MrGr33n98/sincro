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

# Copia arquivos de configuração da raiz
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json tsconfig.json .npmrc ./

# Copia todas as libs do workspace
COPY lib ./lib

# Copia o frontend
COPY artifacts/sincronia ./artifacts/sincronia

# Instala dependências de todo o workspace (com hoisting)
RUN pnpm install --shamefully-hoist --no-frozen-lockfile

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
