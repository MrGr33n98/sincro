# --- Estágio de Build ---
FROM node:18-alpine AS build

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos globais do workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./

# Copia o projeto específico e a lib dependente
COPY lib ./lib
COPY artifacts/sincronia/package.json ./artifacts/sincronia/

# Instala as dependências usando pnpm (resolve os catálogos)
RUN pnpm install --frozen-lockfile --filter "@workspace/sincronia..." || pnpm install --filter "@workspace/sincronia..."

# Copia o código fonte do frontend
COPY artifacts/sincronia ./artifacts/sincronia

# Build da aplicação Vite
# O comando build deve ser rodado dentro do diretório do projeto ou via pnpm filter
WORKDIR /app/artifacts/sincronia
RUN pnpm run build

# --- Estágio de Produção ---
FROM node:18-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build (do estágio de build)
# O Vite coloca o build em dist/ por padrão
COPY --from=build /app/artifacts/sincronia/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos na porta 3000
CMD ["serve", "-s", "dist", "-l", "3000"]