# 📱 Sincronia — Assistente de Relacionamento com IA

> **Ruby on Rails 7.2 + React/Vite PWA** | API REST com ActiveAdmin | Docker-ready

Sincronia é um SaaS para casais brasileiros fortalecerem seus relacionamentos através de:
- Mood tracker diário em casal
- Relationship Health Score (RHS)
- Sugestões de date com IA
- Mediação de conflitos por IA
- AI Concierge chat
- Premium com PIX

---

## 🚀 Quick Start

### Pré-requisitos

- **Ruby** 3.2+
- **Node.js** 20+
- **pnpm** 8+
- **PostgreSQL** 14+
- **Redis** 7+
- **Docker** (opcional, para dev containerizado)

### 1. Clone e Setup

```bash
# Clone o repositório
git clone <repo-url> sincronia
cd sincronia

# Copy .env.example para .env
cp .env.example .env

# Backend (Rails)
cd backend
bundle install
rails db:create db:migrate
rails db:seed  # Cria admin user

# Frontend (React + Vite)
cd ../artifacts/sincronia
pnpm install
```

### 2. Rodar com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d

# Acessar
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# ActiveAdmin: http://localhost:3001/admin
```

### 3. Rodar sem Docker (Desenvolvimento)

```bash
# Terminal 1 — PostgreSQL + Redis
docker-compose up -d db redis

# Terminal 2 — Backend Rails
cd backend
bin/dev  # Roda Puma + Sidekiq

# Terminal 3 — Frontend Vite
cd artifacts/sincronia
pnpm dev
```

---

## 📁 Estrutura do Projeto

```
sincronia/
├── backend/                    # Ruby on Rails 7.2 API
│   ├── app/
│   │   ├── admin/             # ActiveAdmin resources
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   └── serializers/
│   ├── config/
│   │   └── initializers/active_admin.rb
│   └── db/migrate/
│
├── artifacts/sincronia/        # React + Vite PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/         # Avatar, Badge, ProgressBar...
│   │   │   ├── molecules/     # MoodPicker, StatCard...
│   │   │   └── ui/            # shadcn/radix wrappers
│   │   ├── pages/
│   │   │   ├── match-celebration.tsx  # Onboarding wizard
│   │   │   ├── settings.tsx           # Settings tabs
│   │   │   └── ...
│   │   └── lib/tokens.ts      # Design tokens
│
├── docker-compose.yml          # Infra completa
└── .env.example                # Template de variáveis
```

---

## 🔐 Admin User (ActiveAdmin)

Após rodar `rails db:seed`:

- **URL**: `http://localhost:3001/admin`
- **Email**: `admin@sincronia.app`
- **Senha**: `Admin123!`

### Resources disponíveis:

- **AdminUsers** — Gestão de administradores
- **Users** — Usuários do app (Pro/Free, stats)
- **Couples** — Casais cadastrados
- **Mood Entries** — Humores registrados (filtro por hoje)
- **Subscriptions** — Assinaturas e receita (R$ total)

---

## 🎨 Design System

### Neo-Brutalism Romantic Theme

```typescript
// tokens.ts
colors: {
  burgundy: { 900: "#4A0E1F" },  // Deep Burgundy — paixão madura
  rose: { 500: "#FF2E6D" },      // Electric Pink — energia moderna
  sand: { 200: "#F5EFE6" },      // Warm Sand — calor humano
}

typography: {
  display: "'Playfair Display'",  // Serifa editorial
  body: "'General Sans'",         // Geométrica moderna
}

shadow: {
  soft: "0 4px 16px rgba(74,14,31,0.12)",   // Claymorphism
  hard: "4px 4px 0px rgba(74,14,31,1)",     // Neo-brutalism
}
```

### Componentes (Atomic Design)

**Átomos:**
- `Avatar` — Com iniciais e status
- `Badge` — Variantes (pro, free, success, warning)
- `ProgressBar` — Para RHS breakdown
- `Skeleton` — Loading states
- `EmptyState` — Empty states educativos

**Moléculas:**
- `MoodPicker` — Grid de 10 humores
- `StatCard` — Ícone + valor + label
- `RHSBreakdownBar` — Barra de progresso com ícone

---

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    # Criar conta
POST   /api/v1/auth/login       # Login (JWT)
GET    /api/v1/auth/me          # User atual
DELETE /api/v1/auth/logout      # Logout
```

### Couples
```
POST /api/v1/couples/invite     # Gerar link de convite
POST /api/v1/couples/join       # Aceitar convite
GET  /api/v1/couples/profile    # Perfil do casal
PATCH /api/v1/couples/profile   # Atualizar (aniversário, foto)
```

### Moods
```
POST /api/v1/moods              # Check-in diário
GET  /api/v1/moods              # Histórico (days param)
GET  /api/v1/moods/today        # Humor de hoje (ambos)
```

### Dashboard
```
GET /api/v1/dashboard           # Dados completos do dashboard
```

### AI Features
```
POST /api/v1/ai/date-suggestions  # Sugestões de date
POST /api/v1/ai/mediation         # Mediação de conflitos
GET  /api/v1/ai/rhs               # Relationship Health Score
```

### Subscriptions
```
GET  /api/v1/subscriptions/status  # Status da assinatura
POST /api/v1/subscriptions/upgrade # Upgrade Pro (PIX)
```

### OpenAI Conversations
```
GET    /api/v1/openai/conversations           # Listar
POST   /api/v1/openai/conversations           # Criar
GET    /api/v1/openai/conversations/:id       # Ver com mensagens
POST   /api/v1/openai/conversations/:id/messages  # Enviar mensagem
```

---

## 🧪 Testes

```bash
# Backend (RSpec)
cd backend
bundle exec rspec

# Frontend (Jest — a implementar)
cd artifacts/sincronia
pnpm test
```

---

## 📊 Banco de Dados

### Schema principal

```sql
users
  - id, name, email, encrypted_password
  - avatar_url, couple_id, is_pro, pro_expires_at

couples
  - id, user1_id, user2_id
  - anniversary_date, cover_photo_url

invites
  - id, token, inviter_id, couple_id
  - used, expires_at

moods
  - id, user_id, couple_id, mood, note

subscriptions
  - id, user_id, plan, payment_id
  - pix_code, amount, status, expires_at

conversations, messages  # OpenAI chat
```

---

## 🔧 Variáveis de Ambiente

Principais (veja `.env.example` completo):

```bash
# Database
DATABASE_URL=postgresql://postgres:senha@localhost:5432/sincronia_development

# JWT
JWT_SECRET=seu_jwt_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Pagamentos
STRIPE_SECRET_KEY=sk_test_...
MERCADOPAGO_ACCESS_TOKEN=...

# Admin
ADMIN_EMAIL=admin@sincronia.app
ADMIN_PASSWORD=Admin123!
```

---

## 🚀 Deploy (DigitalOcean App Platform)

### 1. Criar App

- Conectar repositório GitHub
- Adicionar banco PostgreSQL 14
- Adicionar Redis 7

### 2. Backend

```yaml
name: sincronia-backend
source_dir: backend
run_command: bundle exec puma -C config/puma.rb
envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.DATABASE_URL}
```

### 3. Frontend

```yaml
name: sincronia-frontend
source_dir: artifacts/sincronia
build_command: pnpm build
run_command: pnpm serve
```

---

## 📈 Roadmap

### Sprint 1-2 (Completo ✅)
- [x] ActiveAdmin setup
- [x] API REST completa
- [x] Design tokens + neo-brutalism
- [x] Átomos e moléculas
- [x] Match Celebration + Onboarding
- [x] Settings pages

### Sprint 3-4 (Próximos)
- [ ] Timeline Emocional (gráfico 30 dias)
- [ ] Nudges de Carinho (notificações)
- [ ] Integração OpenAI real
- [ ] PIX com MercadoPago
- [ ] PWA offline completo

### Sprint 5-6
- [ ] Code splitting
- [ ] Acessibilidade WCAG AA
- [ ] Analytics (PostHog)
- [ ] Monitoramento (Sentry)

---

## 🛡️ Segurança

- JWT com expiração (7 dias)
- Senhas com bcrypt
- CORS configurado
- Rate limiting (Rack::Attack)
- SQL injection protection (ActiveRecord)
- XSS protection (Rails)

---

## 📚 Tech Stack Completa

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Ruby | 3.2 | Linguagem |
| Rails | 7.2.2 | Framework API |
| PostgreSQL | 14 | Banco principal |
| Redis | 7 | Cache + filas |
| Sidekiq | 7 | Background jobs |
| Devise | 4.9 | Autenticação |
| JWT | 3.1 | Auth stateless |
| ActiveAdmin | 3.2 | Painel admin |
| ActiveModelSerializers | 0.10 | JSON serialization |
| PaperTrail | 15 | Auditoria |

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2 | UI library |
| Vite | 5.x | Build tool |
| TypeScript | 5.9 | Tipagem |
| Tailwind CSS | 3.3 | Styling |
| Radix UI | latest | Componentes acessíveis |
| Framer Motion | 12 | Animações |
| React Query | 5.90 | Server state |
| Wouter | 3.3 | Routing |
| Zod | latest | Validação |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie branch para feature (`git checkout -b feature/nova-feature`)
3. Commit mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra Pull Request

---

## 📄 License

MIT — ver arquivo LICENSE

---

## 👥 Time

Desenvolvido com 💕 por **Sincronia Team**

**Stack inspirado em**: Avalia Solar (www.avaliasolar.com.br)

---

## 📞 Suporte

- **Email**: suporte@sincronia.app
- **Docs**: /docs (em construção)
