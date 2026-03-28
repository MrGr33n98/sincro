# ═══════════════════════════════════════════════════════════════════
# Sincronia — Deploy Fix Notes
# ═══════════════════════════════════════════════════════════════════

## Problema 1: Caminhos COPY incorretos no Dockerfile (Backend) ✅ RESOLVIDO

**Erro:** `failed to calculate checksum of ref ... "/backend": not found`

**Causa:** O Dockerfile estava usando caminhos incorretos nas instruções `COPY`.

### Antes (Incorreto)
```dockerfile
COPY backend/Gemfile backend/Gemfile.lock ./
COPY backend/ ./
```

### Depois (Correto)
```dockerfile
COPY Gemfile Gemfile.lock ./
COPY . ./
```

**Explicação:** Como o contexto de build no `docker-compose.yml` é `./backend`, os caminhos no Dockerfile devem ser relativos à pasta `backend/`, não à raiz do projeto.

---

## Problema 2: Gemfile.lock desatualizado ✅ RESOLVIDO

**Erro:** `Could not find gem 'factory_bot_rails (~> 6.4)' in locally installed gems`

**Causa:** O `Gemfile.lock` não foi atualizado/commitado após adicionar novas gems ao Gemfile.

### Gems Adicionadas
- `rack-attack` - Rate limiting
- `ruby-openai` - OpenAI API
- `sentry-ruby` - Error tracking
- `sentry-rails` - Rails integration
- `httparty` - HTTP client
- `aws-sdk-s3` - S3 backup
- `factory_bot_rails` - Test factories
- `faker` - Test data

### Solução
```bash
cd backend
bundle install
git add Gemfile.lock
git commit -m "fix: atualiza Gemfile.lock com novas dependências"
git push
```

---

## Problema 3: Rails API mode não tem assets:precompile ✅ RESOLVIDO

**Erro:** `Don't know how to build task 'assets:precompile'`

**Causa:** O Rails está em **API mode** e não possui a task `assets:precompile`.

### Solução
Removida a linha do Dockerfile:
```dockerfile
# ANTES (errado)
RUN SECRET_KEY_BASE=dummy bundle exec rails assets:precompile

# DEPOIS (correto - removido)
# API mode não precisa de precompile
```

---

## Problema 4: Dockerfile do frontend com caminhos incorretos ✅ RESOLVIDO

**Erro:** `failed to calculate checksum of ref ... "/artifacts/sincronia": not found`

**Causa:** O Dockerfile do frontend estava tentando copiar arquivos de fora do contexto de build (`./artifacts/sincronia`).

### Antes (Incorreto)
```dockerfile
COPY lib ./lib
COPY artifacts/sincronia ./artifacts/sincronia
COPY pnpm-workspace.yaml ./
```

### Depois (Correto - Standalone)
```dockerfile
COPY package.json pnpm-lock.yaml* ./
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig.json ./
```

**Explicação:** O frontend agora faz build standalone, sem depender do workspace monorepo.

---

## Arquivos Modificados

1. `backend/Dockerfile` — Corrigidos os caminhos COPY + removido assets:precompile
2. `backend/Gemfile.lock` — Atualizado com todas as gems
3. `artifacts/sincronia/Dockerfile` — Simplificado para build standalone

---

## Como Testar Localmente

```bash
# Na raiz do projeto
docker-compose build backend
docker-compose build frontend
docker-compose up -d
docker-compose logs -f
```

---

## Estrutura Correta do Build Context

```
sincronia/
├── docker-compose.yml
│   ├── backend: context: ./backend
│   └── frontend: context: ./artifacts/sincronia
├── backend/
│   ├── Dockerfile              # COPY Gemfile ... (não COPY backend/Gemfile)
│   ├── Gemfile
│   ├── Gemfile.lock            # SEMPRE atualizar após mudar Gemfile
│   └── app/
└── artifacts/sincronia/
    ├── Dockerfile              # COPY package.json ... (standalone)
    ├── package.json
    ├── src/
    └── dist/                   # Build output
```

---

## Checklist Pré-Deploy

Sempre antes de deploy, verificar:

- [ ] `backend/Gemfile.lock` está atualizado (`bundle install`)
- [ ] `backend/Gemfile.lock` está commitado no git
- [ ] Dockerfiles usam caminhos relativos ao contexto
- [ ] Todas as gems necessárias estão no Gemfile
- [ ] Frontend Dockerfile é standalone (não depende de workspace)

---

*Correções aplicadas em 2026-03-28*
