#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# Sincronia — Setup Script
# ═══════════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Sincronia setup..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Ruby
    if ! command -v ruby &> /dev/null; then
        log_error "Ruby is not installed. Please install Ruby 3.2+"
        exit 1
    fi
    log_success "Ruby $(ruby -v) installed"

    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 20+"
        exit 1
    fi
    log_success "Node.js $(node -v) installed"

    # pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm is not installed. Installing..."
        npm install -g pnpm
    fi
    log_success "pnpm $(pnpm -v) installed"

    # Docker (optional)
    if command -v docker &> /dev/null; then
        log_success "Docker $(docker --version) installed (optional)"
    else
        log_warning "Docker not installed. You'll need to run PostgreSQL and Redis manually."
    fi
}

# Setup environment files
setup_env() {
    log_info "Setting up environment files..."

    if [ ! -f .env ]; then
        cp .env.example .env
        log_success ".env file created from .env.example"

        # Generate secret keys
        if command -v openssl &> /dev/null; then
            SECRET_KEY_BASE=$(openssl rand -hex 64)
            JWT_SECRET=$(openssl rand -hex 32)
            sed -i.bak "s/SECRET_KEY_BASE=/SECRET_KEY_BASE=${SECRET_KEY_BASE}/" .env
            sed -i.bak "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/" .env
            rm .env.bak 2>/dev/null || true
            log_success "Secret keys generated"
        fi
    else
        log_warning ".env file already exists"
    fi
}

# Setup backend
setup_backend() {
    log_info "Setting up backend (Rails)..."

    cd backend

    # Install Ruby gems
    log_info "Installing Ruby gems..."
    bundle install
    log_success "Ruby gems installed"

    # Setup database
    log_info "Setting up database..."

    if command -v docker &> /dev/null && docker ps | grep -q sincronia-postgres; then
        log_info "Using Docker PostgreSQL..."
        sleep 5  # Wait for PostgreSQL to be ready
    fi

    rails db:create 2>/dev/null || log_warning "Database already exists"
    rails db:migrate
    log_success "Database migrated"

    # Seed database
    log_info "Seeding database..."
    rails db:seed
    log_success "Database seeded"

    cd ..
}

# Setup frontend
setup_frontend() {
    log_info "Setting up frontend (React + Vite)..."

    cd artifacts/sincronia

    # Install dependencies
    log_info "Installing pnpm dependencies..."
    pnpm install
    log_success "Frontend dependencies installed"

    cd ../..
}

# Show next steps
show_next_steps() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_success "Setup completed successfully!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    log_info "Next steps:"
    echo ""
    echo "1. Start Docker services (PostgreSQL + Redis):"
    echo "   ${GREEN}docker-compose up -d db redis${NC}"
    echo ""
    echo "2. Start backend (Rails):"
    echo "   ${GREEN}cd backend && bin/dev${NC}"
    echo ""
    echo "3. Start frontend (Vite):"
    echo "   ${GREEN}cd artifacts/sincronia && pnpm dev${NC}"
    echo ""
    echo "4. Access the application:"
    echo "   Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo "   Backend:   ${GREEN}http://localhost:3001${NC}"
    echo "   Admin:     ${GREEN}http://localhost:3001/admin${NC}"
    echo ""
    echo "5. Login credentials:"
    echo "   Admin:  admin@sincronia.app / Admin123!"
    echo "   User 1: felipe@test.com / 123456"
    echo "   User 2: lari@test.com / 123456"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

# Main execution
main() {
    check_prerequisites
    setup_env
    setup_backend
    setup_frontend
    show_next_steps
}

# Run main
main
