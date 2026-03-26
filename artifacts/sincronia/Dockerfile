# --- Estágio de Build ---
FROM node:18-alpine AS build

WORKDIR /app

# Instala dependências
COPY package.json package-lock.json* ./
# Note: Usamos 'npm install' pois o 'npm ci' pode falhar se o lock estiver desalinhado
RUN npm install

# Copia o resto do código
COPY . .

# Build da aplicação Vite
RUN npm run build

# --- Estágio de Produção ---
FROM node:18-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia apenas os arquivos do build
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Serve os arquivos estáticos na porta 3000, redirecionando todas as rotas para index.html (SPA)
CMD ["serve", "-s", "dist", "-l", "3000"]