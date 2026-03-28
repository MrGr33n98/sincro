# ═══════════════════════════════════════════════════════════════════
# Sincronia Backend — Dockerfile (Ruby on Rails 7.2)
# ═══════════════════════════════════════════════════════════════════

FROM ruby:3.2.3-slim as base

# Install dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    libvips \
    pkg-config \
    curl \
    gnupg2 \
    git \
    && rm -rf /var/lib/apt/lists/*


# Set working directory
WORKDIR /app

# Install dependencies
COPY Gemfile Gemfile.lock ./
RUN bundle config set without 'development test' && \
    bundle install -j4 --retry 3 && \
    rm -rf /usr/local/bundle/cache

# Copy application code
COPY . ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/up || exit 1

# Start Puma
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]

# ═══════════════════════════════════════════════════════════════════
# Development stage
# ═══════════════════════════════════════════════════════════════════

FROM base as development

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    less \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN bundle config unset without

COPY Gemfile Gemfile.lock ./
RUN bundle install -j4 --retry 3

COPY . ./

CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3001"]
