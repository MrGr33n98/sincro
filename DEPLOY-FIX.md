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

### Depois (Correto - Workspace Monorepo)
```dockerfile
# Dockerfile agora usa contexto da raiz
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY artifacts/sincronia/package.json ./artifacts/sincronia/
RUN pnpm install --filter "@workspace/sincronia..." --no-frozen-lockfile
```

**Explicação:** O frontend agora faz build a partir da raiz do projeto para acessar o `pnpm-lock.yaml` e as dependências do workspace.

**docker-compose.yml atualizado:**
```yaml
frontend:
  build:
    context: .              # Raiz do projeto
    dockerfile: artifacts/sincronia/Dockerfile
```

---

## Problema 5: Frontend pnpm-lock.yaml ausente ✅ RESOLVIDO

**Erro:** `ERR_PNPM_NO_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent`

**Causa:** O `pnpm-lock.yaml` está na raiz do projeto, mas o contexto de build era `./artifacts/sincronia`.

### Solução
1. Dockerfile do frontend agora usa o contexto da raiz (`.`)
2. docker-compose.yml atualizado para usar contexto da raiz
3. Build instala dependências com `--no-frozen-lockfile`

---

## Problema 6: PORT exigida no build do frontend ✅ RESOLVIDO

**Erro:** `Error: PORT environment variable is required but was not provided.`

**Causa:** O `vite.config.ts` exigia PORT e BASE_PATH mesmo durante o build em CI.

### Solução
Tornar PORT e BASE_PATH opcionais durante o build:

```typescript
// Antes (exigia sempre)
const rawPort = process.env.PORT;
if (!rawPort) {
  throw new Error("PORT environment variable is required...");
}

// Depois (usa defaults em CI/production)
const isCI = process.env.CI === "true";
const isProduction = process.env.NODE_ENV === "production";
const port = rawPort ? Number(rawPort) : (isCI || isProduction ? 3000 : 5173);
const basePath = process.env.BASE_PATH || "/";
```

---

## Arquivos Modificados

1. `backend/Dockerfile` — Corrigidos os caminhos COPY + removido assets:precompile
2. `backend/Gemfile.lock` — Atualizado com todas as gems
3. `artifacts/sincronia/Dockerfile` — Usa contexto da raiz (workspace monorepo)
4. `docker-compose.yml` — Frontend context alterado para `.`
5. `artifacts/sincronia/vite.config.ts` — PORT e BASE_PATH opcionais em CI

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
│   └── frontend: context: . (raiz)
├── pnpm-workspace.yaml       # Workspace config
├── pnpm-lock.yaml            # Lockfile do workspace
├── backend/
│   ├── Dockerfile            # COPY Gemfile ... (context: ./backend)
│   ├── Gemfile
│   ├── Gemfile.lock
│   └── app/
└── artifacts/sincronia/
    ├── Dockerfile            # COPY da raiz (context: .)
    ├── package.json
    ├── src/
    └── dist/                 # Build output
```

---

## Checklist Pré-Deploy

Sempre antes de deploy, verificar:

- [ ] `backend/Gemfile.lock` está atualizado (`bundle install`)
- [ ] `backend/Gemfile.lock` está commitado no git
- [ ] `pnpm-lock.yaml` está commitado no git
- [ ] Backend Dockerfile usa caminhos relativos ao contexto (`./backend`)
- [ ] Frontend Dockerfile usa contexto da raiz (`.`)
- [ ] Todas as gems necessárias estão no Gemfile
- [ ] Dependências do Replit podem ser ignoradas em produção

---

## Problema 7: Frontend package.json com catalog: e workspace: refs ✅ RESOLVIDO

**Erro:** `ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC No catalog entry '@replit/vite-plugin-cartographer' was found for catalog 'default'.`

**Causa:** O Dockerfile do frontend agora age como um projeto standalone fora do workspace monorepo para simplificar o build, mas o `package.json` original usava a feature de "catalog" do PNPM que só existe dentro de um workspace.

### Solução
Substituídas todas as referências `catalog:` pelas versões reais definidas no `pnpm-workspace.yaml` e removidas dependências de `@workspace/*`.

```json
// Antes
"@replit/vite-plugin-cartographer": "catalog:",

// Depois
"@replit/vite-plugin-cartographer": "^0.5.1",
```

Isso permitiu que o `pnpm install` funcionasse corretamente dentro do container Docker sem depender da estrutura completa do monorepo.

---

*Correções aplicadas em 2026-03-28*
