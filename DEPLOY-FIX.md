# ═══════════════════════════════════════════════════════════════════
# Sincronia — Deploy Fix Notes
# ═══════════════════════════════════════════════════════════════════

## Problema Corrigido

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

## Arquivo Modificado

- `backend/Dockerfile` — Corrigidos os caminhos COPY

---

## Como Testar Localmente

```bash
# Na raiz do projeto
docker-compose build backend
docker-compose up -d backend
docker-compose logs -f backend
```

---

## Próximo Deploy

O próximo deploy no GitHub Actions deve funcionar corretamente.

Se ainda houver erro, verifique:

1. **Gemfile.lock está no repositório:**
   ```bash
   git ls-files backend/Gemfile.lock
   ```

2. **Faça commit e push das mudanças:**
   ```bash
   git add backend/Dockerfile
   git commit -m "fix: corrige caminhos COPY no Dockerfile"
   git push
   ```

---

## Estrutura Correta do Build Context

```
sincronia/
├── docker-compose.yml          # context: ./backend
└── backend/
    ├── Dockerfile              # COPY Gemfile ... (não COPY backend/Gemfile)
    ├── Gemfile
    ├── Gemfile.lock
    └── app/
```

---

*Correção aplicada em 2026-03-28*
