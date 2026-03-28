# frozen_string_literal: true

module Api
  module V1
    class CouplesController < ApplicationController
      before_action :ensure_has_couple, only: [:profile, :update_profile]

      def invite
        invite = current_user.invites.create!(
          expires_at: 24.hours.from_now,
          token: SecureRandom.hex(32)
        )

        render json: {
          token: invite.token,
          expires_at: invite.expires_at,
          invite_url: "#{request.base_url}/join/#{invite.token}"
        }, status: :created
      end

      def join
        invite = Invite.find_by(token: couple_params[:token])

        if invite.nil?
          return render_error("Invite not found", status: :not_found)
        end

        if invite.used?
          return render_error("Invite already used", status: :unprocessable_entity)
        end

        if invite.expired?
          return render_error("Invite expired", status: :unprocessable_entity)
        end

        # Create couple and associate both users
        couple = Couple.create!(
          user1: invite.user,
          user2: current_user
        )

        current_user.update!(couple_id: couple.id)
        invite.update!(used: true, couple_id: couple.id)

        render json: CoupleSerializer.new(couple), status: :ok
      end

      def profile
        render json: CoupleSerializer.new(current_user.couple)
      end

      def update_profile
        couple = current_user.couple

        if couple.update(couple_params.permit(:anniversary_date, :cover_photo_url))
          render json: CoupleSerializer.new(couple)
        else
          render json: {
            error: true,
            message: couple.errors.full_messages.join(", ")
          }, status: :unprocessable_entity
        end
      end

      private

      def couple_params
        params.permit(:token, :anniversary_date, :cover_photo_url)
      end

      def ensure_has_couple
        unless current_user.couple
          render_error("User does not belong to a couple", status: :not_found)
        end
      end
    end
  end
end
