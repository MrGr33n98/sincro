# --- Estágio de Build ---
FROM node:18-alpine AS build

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos globais do workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json .env ./

# Copia TODAS as bibliotecas (lib/) pois o workspace depende de múltiplas libs
COPY lib ./lib
COPY artifacts/sincronia/package.json ./artifacts/sincronia/

# Instala as dependências (sem frozen-lockfile para permitir resolver arquitetura linux-x64-musl)
RUN pnpm install --filter "@workspace/sincronia..." --no-frozen-lockfile

# Copia o código fonte do frontend
COPY artifacts/sincronia ./artifacts/sincronia

# Build da aplicação Vite
WORKDIR /app/artifacts/sincronia
RUN pnpm run build

# --- Estágio de Produção ---
FROM node:18-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build
COPY --from=build /app/artifacts/sincronia/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]