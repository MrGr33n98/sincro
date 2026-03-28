# frozen_string_literal: true

module Api
  module V1
    class MoodsController < ApplicationController
      before_action :ensure_has_couple, only: [:today]
      before_action :initialize_openai_service, only: [:create, :today]

      def create
        mood = current_user.moods.create!(
          mood_params.merge(
            couple_id: current_user.couple_id,
            created_at: Time.zone.beginning_of_day
          )
        )

        # Check if both partners checked in today
        partner_mood = Mood.where(couple_id: current_user.couple_id)
                           .where.not(user_id: current_user.id)
                           .where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day)
                           .first

        ai_insight = nil
        if partner_mood && @openai_service
          ai_insight = @openai_service.generate_mood_insight(
            user_mood: mood.mood,
            partner_mood: partner_mood.mood
          )
        end

        render json: {
          mood: MoodSerializer.new(mood),
          partner_mood: partner_mood ? MoodSerializer.new(partner_mood) : nil,
          both_checked_in: partner_mood.present?,
          ai_insight: ai_insight
        }, status: :created
      end

      def index
        days = params[:days]&.to_i || 30
        moods = current_user.moods
                           .where("created_at >= ?", days.days.ago)
                           .order(created_at: :desc)

        render json: MoodSerializer.new(moods, many: true)
      end

      def today
        today_start = Time.zone.beginning_of_day
        today_end = Time.zone.end_of_day

        my_mood = current_user.moods
                           .where(created_at: today_start..today_end)
                           .first

        partner_mood = Mood.where(couple_id: current_user.couple_id)
                           .where.not(user_id: current_user.id)
                           .where(created_at: today_start..today_end)
                           .first

        ai_insight = nil
        if my_mood && partner_mood && @openai_service
          ai_insight = @openai_service.generate_mood_insight(
            user_mood: my_mood.mood,
            partner_mood: partner_mood.mood
          )
        end

        render json: {
          myMood: my_mood ? MoodSerializer.new(my_mood) : nil,
          partnerMood: partner_mood ? MoodSerializer.new(partner_mood) : nil,
          bothCheckedIn: my_mood.present? && partner_mood.present?,
          aiInsight: ai_insight
        }
      end

      private

      def initialize_openai_service
        @openai_service = OpenAIService.new if ENV['OPENAI_API_KEY'].present?
      end

      def mood_params
        params.permit(:mood, :note)
      end

      def ensure_has_couple
        unless current_user.couple
          render_error("User does not belong to a couple", status: :not_found)
        end
      end
    end
  end
end
