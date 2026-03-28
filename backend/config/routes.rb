Rails.application.routes.draw do
  # API Routes (versioned)
  namespace :api do
    namespace :v1 do
      # Health
      get "health" => "health#show"
      get "health/liveness" => "health#liveness"

      # Authentication
      post "auth/register" => "auth#register"
      post "auth/login" => "auth#login"
      get "auth/me" => "auth#me"
      delete "auth/logout" => "auth#logout"

      # Couples
      post "couples/invite" => "couples#invite"
      post "couples/join" => "couples#join"
      get "couples/profile" => "couples#profile"
      patch "couples/profile" => "couples#update_profile"

      # Moods
      post "moods" => "moods#create"
      get "moods" => "moods#index"
      get "moods/today" => "moods#today"

      # Dashboard
      get "dashboard" => "dashboard#show"

      # AI Features
      post "ai/date-suggestions" => "ai#date_suggestions"
      post "ai/mediation" => "ai#mediation"
      get "ai/rhs" => "ai#rhs"

      # Subscriptions
      get "subscriptions/status" => "subscriptions#status"
      post "subscriptions/upgrade" => "subscriptions#upgrade"
      post "webhooks/mercado_pago" => "subscriptions#webhook"

      # OpenAI Conversations
      get "openai/conversations" => "openai/conversations#index"
      post "openai/conversations" => "openai/conversations#create"
      get "openai/conversations/:id" => "openai/conversations#show"
      post "openai/conversations/:id/messages" => "openai/conversations#send_message"
    end
  end

  # Root
  root to: redirect("/up")
end
