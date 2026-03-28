#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# Sincronia — Production Setup Script
# ═══════════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Sincronia production setup..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Check .env file
check_env() {
    log_info "Checking .env file..."
    
    if [ ! -f .env ]; then
        log_warning ".env not found. Creating from .env.example..."
        cp .env.example .env
        log_success ".env created. Please fill in the values!"
        echo ""
        echo "Required variables to configure:"
        echo "  - OPENAI_API_KEY"
        echo "  - MERCADOPAGO_ACCESS_TOKEN"
        echo "  - SENTRY_DSN"
        echo "  - VITE_POSTHOG_KEY"
        echo "  - SPACES_ACCESS_KEY_ID"
        echo "  - SPACES_SECRET_ACCESS_KEY"
        echo ""
        return 1
    else
        log_success ".env file exists"
        
        # Check critical variables
        missing_vars=()
        
        if ! grep -q "OPENAI_API_KEY=sk-" .env; then
            missing_vars+=("OPENAI_API_KEY")
        fi
        
        if ! grep -q "MERCADOPAGO_ACCESS_TOKEN=" .env || grep -q "MERCADOPAGO_ACCESS_TOKEN=$" .env; then
            missing_vars+=("MERCADOPAGO_ACCESS_TOKEN")
        fi
        
        if ! grep -q "SENTRY_DSN=https://" .env; then
            missing_vars+=("SENTRY_DSN / VITE_SENTRY_DSN")
        fi
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_warning "Missing critical variables: ${missing_vars[*]}"
            echo "Please edit .env and fill in these values."
            return 1
        fi
        
        log_success "All critical variables configured"
    fi
}

# Setup backend
setup_backend() {
    log_info "Setting up backend (Rails)..."
    
    cd backend
    
    # Install gems
    log_info "Installing Ruby gems..."
    bundle install
    log_success "Gems installed"
    
    # Setup database
    log_info "Setting up database..."
    rails db:create 2>/dev/null || log_warning "Database already exists"
    rails db:migrate
    log_success "Database migrated"
    
    # Seed database
    log_info "Seeding database..."
    rails db:seed
    log_success "Database seeded"
    
    # Precompile assets
    log_info "Precompiling assets..."
    rails assets:precompile
    log_success "Assets precompiled"
    
    cd ..
}

# Setup frontend
setup_frontend() {
    log_info "Setting up frontend (React + Vite)..."
    
    cd artifacts/sincronia
    
    # Install dependencies
    log_info "Installing pnpm dependencies..."
    pnpm install
    log_success "Dependencies installed"
    
    # Build
    log_info "Building frontend..."
    pnpm build
    log_success "Frontend built"
    
    cd ../..
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    cd backend
    
    # Run RSpec
    bundle exec rspec --format progress
    
    if [ $? -eq 0 ]; then
        log_success "Tests passed!"
    else
        log_warning "Some tests failed. Check output above."
    fi
    
    cd ..
}

# Show next steps
show_next_steps() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_success "Production setup completed!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    log_info "Next steps:"
    echo ""
    echo "1. Review and fill .env file with production values:"
    echo "   ${GREEN}vim .env${NC}"
    echo ""
    echo "2. Start all services with Docker:"
    echo "   ${GREEN}docker-compose up -d${NC}"
    echo ""
    echo "3. Check service health:"
    echo "   ${GREEN}docker-compose ps${NC}"
    echo ""
    echo "4. View logs:"
    echo "   ${GREEN}docker-compose logs -f${NC}"
    echo ""
    echo "5. Access the application:"
    echo "   Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo "   Backend:   ${GREEN}http://localhost:3001${NC}"
    echo "   Admin:     ${GREEN}http://localhost:3001/admin${NC}"
    echo ""
    echo "6. Configure production services:"
    echo "   - Sentry: Add DSN to .env"
    echo "   - PostHog: Add API key to .env"
    echo "   - OpenAI: Add API key to .env"
    echo "   - MercadoPago: Add credentials to .env"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_info "Documentation:"
    echo "  - PRODUCTION-READY.md: Complete production guide"
    echo "  - DIAGNOSTIC-PRODUCTION.md: Initial diagnostic"
    echo "  - README.md: Project overview"
    echo "═══════════════════════════════════════════════════════════"
}

# Main execution
main() {
    check_env || true  # Continue even if .env check fails
    setup_backend
    setup_frontend
    run_tests || true  # Continue even if tests fail
    show_next_steps
}

# Run main
main
