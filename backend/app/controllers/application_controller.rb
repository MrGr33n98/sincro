class ApplicationController < ActionController::API
  before_action :set_sentry_user
  
  rescue_from Exception, with: :handle_exception
  
  private
  
  def set_sentry_user
    if current_user && defined?(Sentry)
      Sentry.set_user(id: current_user.id, email: current_user.email)
    end
  rescue => e
    Rails.logger.debug "[Sentry] Error setting user: #{e.message}"
  end
  
  def handle_exception(exception)
    # Log to Sentry
    if defined?(Sentry)
      Sentry.capture_exception(exception)
    end
    
    # Return appropriate error response
    case exception
    when ActiveRecord::RecordNotFound
      render_error("Resource not found", status: :not_found)
    when ActiveRecord::RecordInvalid
      render_error(exception.record.errors.full_messages.join(", "), status: :unprocessable_entity)
    when ActionController::ParameterMissing
      render_error("Missing required parameter: #{exception.param}", status: :bad_request)
    when JWT::DecodeError
      render_error("Invalid authentication token", status: :unauthorized)
    when Pundit::NotAuthorizedError
      render_error("You are not authorized to perform this action", status: :forbidden)
    else
      Rails.logger.error "Unhandled exception: #{exception.message}"
      Rails.logger.error exception.backtrace.join("\n") if Rails.env.development?
      
      render_error(
        Rails.env.development? ? exception.message : "Internal server error",
        status: :internal_server_error
      )
    end
  end
  
  def render_error(message, status: :bad_request)
    render json: { error: true, message: message }, status: status
  end
end
