# config/initializers/rack_attack.rb

class Rack::Attack
  ### Configure Cache ###

  # 1. Use Redis for production, memory store for development
  if defined?(Redis) && ENV['REDIS_URL'].present?
    require "redis"
    redis = Redis.new(url: ENV['REDIS_URL'])
    Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(redis: redis)
  else
    # Fallback to memory store for development
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
  end

  ### Configure Throttling ###

  # 2. Throttle login requests per IP (prevent brute force)
  # Limit to 5 requests per minute per IP
  throttle('auth/login/ip', limit: 5, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.ip
    end
  end

  # 3. Throttle login requests per email (prevent credential stuffing)
  # Limit to 3 requests per minute per email
  throttle('auth/login/email', limit: 3, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.params.dig('email')&.to_s&.downcase
    end
  end

  # 4. Throttle registration requests per IP
  # Limit to 3 registrations per hour per IP
  throttle('auth/register/ip', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/register' && req.post?
      req.ip
    end
  end

  # 5. Throttle API requests per IP (general rate limiting)
  # Limit to 100 requests per minute per IP
  throttle('api/requests/ip', limit: 100, period: 1.minute) do |req|
    if req.path.start_with?('/api')
      req.ip
    end
  end

  # 6. Throttle AI endpoints per user (prevent abuse)
  # Limit to 10 AI requests per minute per user
  throttle('ai/requests/user', limit: 10, period: 1.minute) do |req|
    if req.path.start_with?('/api/v1/ai')
      # Extract user ID from JWT token if available
      token = req.headers['Authorization']&.split(' ')&.last
      if token
        begin
          payload = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256').first
          payload['sub']&.to_s
        rescue JWT::DecodeError
          req.ip
        end
      else
        req.ip
      end
    end
  end

  # 7. Throttle mood check-ins per user
  # Limit to 10 mood check-ins per hour per user
  throttle('moods/create/user', limit: 10, period: 1.hour) do |req|
    if req.path == '/api/v1/moods' && req.post?
      token = req.headers['Authorization']&.split(' ')&.last
      if token
        begin
          payload = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256').first
          payload['sub']&.to_s
        rescue JWT::DecodeError
          req.ip
        end
      else
        req.ip
      end
    end
  end

  ### Custom Throttle Responses ###

  # 8. Customize throttle response
  self.throttled_responder = lambda do |req|
    match_data = req.env['rack.attack.match_data']
    
    Rails.logger.warn "[Rack::Attack] Throttled: #{match_data[:name]} for #{match_data[:data]}"
    
    {
      status: 429,
      body: {
        error: true,
        message: 'Too many requests. Please try again later.',
        retry_after: match_data[:period] - (Time.now.to_i % match_data[:period])
      }.to_json,
      headers: {
        'Content-Type' => 'application/json',
        'Retry-After' => match_data[:period].to_s
      }
    }
  end

  ### Allowlist ###

  # 9. Allow requests from localhost (development)
  allow('localhost') do |req|
    req.ip == '127.0.0.1' || req.ip == '::1'
  end

  # 10. Allow health check endpoints (no throttling)
  allow('health checks') do |req|
    req.path.in?(['/up', '/health', '/health/liveness'])
  end

  ### Logging ###

  # 11. Log throttled requests
  self.notifier = lambda do |message|
    Rails.logger.warn "[Rack::Attack] #{message}"
  end
end
