# ═══════════════════════════════════════════════════════════════════
# Sincronia — Deploy Fix Notes
# ═══════════════════════════════════════════════════════════════════

## Problema 1: Caminhos COPY incorretos no Dockerfile ✅ RESOLVIDO

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

## Arquivos Modificados

1. `backend/Dockerfile` — Corrigidos os caminhos COPY
2. `backend/Gemfile.lock` — Atualizado com todas as gems

---

## Como Testar Localmente

```bash
# Na raiz do projeto
docker-compose build backend
docker-compose up -d backend
docker-compose logs -f backend
```

---

## Estrutura Correta do Build Context

```
sincronia/
├── docker-compose.yml          # context: ./backend
└── backend/
    ├── Dockerfile              # COPY Gemfile ... (não COPY backend/Gemfile)
    ├── Gemfile
    ├── Gemfile.lock            # SEMPRE atualizar após mudar Gemfile
    └── app/
```

---

## Checklist Pré-Deploy

Sempre antes de deploy, verificar:

- [ ] `backend/Gemfile.lock` está atualizado (`bundle install`)
- [ ] `backend/Gemfile.lock` está commitado no git
- [ ] Dockerfile usa caminhos relativos ao contexto
- [ ] Todas as gems necessárias estão no Gemfile

---

*Correções aplicadas em 2026-03-28*
