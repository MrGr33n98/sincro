# frozen_string_literal: true

module Api
  module V1
    class ApplicationController < ActionController::API
      include ActionController::Cookies
      include Pundit::Authorization

      rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
      rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :record_invalid

      private

      def current_user
        @current_user ||= authenticate_user!
      end

      def authenticate_user!
        token = request.headers["Authorization"]&.split(" ")&.last
        return head :unauthorized unless token

        payload = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: "HS256" })[0]
        user_id = payload["sub"]&.to_i

        @current_user = User.find_by(id: user_id)
        head :unauthorized unless @current_user

        @current_user
      end

      def pundit_user
        current_user
      end

      def user_not_authorized
        render json: { error: "Not authorized", message: "You are not authorized to perform this action" }, status: :forbidden
      end

      def record_not_found
        render json: { error: "Not found", message: "The requested resource was not found" }, status: :not_found
      end

      def record_invalid(exception)
        render json: { 
          error: "Validation failed", 
          message: exception.record.errors.full_messages.join(", ") 
        }, status: :unprocessable_entity
      end

      def render_error(message, status:)
        render json: { error: true, message: message }, status: status
      end
    end
  end
end
