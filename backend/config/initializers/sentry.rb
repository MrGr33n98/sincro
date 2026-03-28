# frozen_string_literal: true

if ENV['SENTRY_DSN'].present?
  Sentry.init do |config|
    config.dsn = ENV['SENTRY_DSN']
    config.breadcrumbs_logger = [:active_support_logger, :http_logger]
    config.environment = ENV.fetch('SENTRY_ENVIRONMENT', Rails.env)
    config.release = ENV.fetch('SENTRY_RELEASE', 'main')
    
    # Set traces_sample_rate to capture 10% of
    # transactions for performance monitoring.
    config.traces_sample_rate = 0.1
    
    # Set profiles_sample_rate to profile 10%
    # of sampled transactions.
    config.profiles_sample_rate = 0.1
    
    # Filter out common errors that we don't want to track
    config.excluded_exceptions += [
      'ActiveRecord::RecordNotFound',
      'ActionController::RoutingError',
      'ActionController::InvalidAuthenticityToken',
      'ActionDispatch::Http::MimeNegotiation::InvalidType',
      'Rack::QueryParser::ParameterTypeError',
      'Rack::QueryParser::InvalidParameterError',
      'CGI::Session::CookieStore::TamperedWithCookie',
      'Mongoid::Errors::DocumentNotFound'
    ]
    
    # Add user context automatically
    config.send_default_pii = false
    
    # Custom before_send hook
    config.before_send = lambda do |event, hint|
      # Add custom context
      event.tags ||= {}
      event.tags[:rails_env] = Rails.env
      
      # You can filter out certain errors here
      exception = hint[:exception]
      if exception&.is_a?(ActiveRecord::RecordNotFound)
        nil  # Don't send this event to Sentry
      else
        event
      end
    end
  end
end
