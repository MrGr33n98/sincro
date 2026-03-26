FROM ruby:3.2.2-slim

# Dependências do sistema
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar apenas gems de produção (sem test/development)
COPY Gemfile ./
RUN bundle config set --local without 'development test' \
  && bundle install --jobs 4 --retry 3

# Copiar o restante da aplicação
COPY . .

EXPOSE 3001

CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3001"]