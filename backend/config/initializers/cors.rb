# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Parse CORS_ORIGINS from env (comma-separated) or default to localhost for dev
    origins ENV.fetch('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization', 'X-CSRF-Token']
  end
end
