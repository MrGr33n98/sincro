# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:register, :login]

      def register
        user = User.new(user_params)

        if user.save
          token = generate_token(user)
          render json: {
            token: token,
            user: UserSerializer.new(user)
          }, status: :created
        else
          render json: {
            error: true,
            message: user.errors.full_messages.join(", ")
          }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: user_params[:email]&.downcase)

        if user&.valid_password?(user_params[:password])
          token = generate_token(user)
          render json: {
            token: token,
            user: UserSerializer.new(user)
          }
        else
          render json: {
            error: true,
            message: "Invalid email or password"
          }, status: :unauthorized
        end
      end

      def me
        render json: UserSerializer.new(current_user)
      end

      def logout
        # JWT is stateless, so logout is handled client-side
        # We can add token blacklisting with Redis if needed
        head :ok
      end

      private

      def user_params
        params.permit(:email, :password, :name)
      end

      def generate_token(user)
        payload = {
          sub: user.id,
          email: user.email,
          exp: 7.days.from_now.to_i
        }

        JWT.encode(payload, Rails.application.secret_key_base, "HS256")
      end
    end
  end
end
