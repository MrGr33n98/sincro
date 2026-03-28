# frozen_string_literal: true

module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:show, :liveness]

      def show
        render json: { status: "healthy", timestamp: Time.zone.now }
      end

      def liveness
        render json: { status: "alive" }
      end
    end
  end
end
