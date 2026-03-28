# frozen_string_literal: true

module Api
  module V1
    class AIController < ApplicationController
      before_action :ensure_has_couple, only: [:date_suggestions, :mediation]
      before_action :initialize_openai_service

      def date_suggestions
        # Validate params
        return render_error("Budget is required", status: :bad_request) unless params[:budget]
        return render_error("City is required", status: :bad_request) unless params[:city]

        budget = params[:budget]
        city = params[:city]
        preferences = params[:preferences] || []
        count = params[:count] || 3

        # Generate suggestions using OpenAI
        suggestions = @openai_service.generate_date_suggestions(
          budget: budget,
          city: city,
          preferences: preferences,
          count: count
        )

        render json: { suggestions: suggestions }
      end

      def mediation
        concern = params[:concern]
        context = params[:context]

        return render_error("Concern is required", status: :bad_request) unless concern

        # Generate mediation using OpenAI
        mediation_result = @openai_service.generate_mediation(
          concern: concern,
          context: context
        )

        render json: mediation_result
      end

      def rhs
        # Get Relationship Health Score
        render json: {
          current: calculate_rhs_score,
          trend: calculate_rhs_trend,
          variation: calculate_rhs_variation,
          breakdown: calculate_rhs_breakdown
        }
      end

      private

      def initialize_openai_service
        @openai_service = OpenAIService.new
      end

      def calculate_rhs_score
        # Calculate based on mood consistency, communication, quality time
        couple = current_user.couple
        return 0 unless couple
        
        # Get last 30 days of moods
        moods_last_30 = Mood.where(couple_id: couple.id)
                           .where('created_at >= ?', 30.days.ago)
                           .count
        
        # Base score on participation (max 40 points)
        participation_score = [(moods_last_30.to_f / 60 * 40), 40].min
        
        # Add points for consistency (max 30 points)
        consistency_score = 30
        
        # Add points for recent activity (max 30 points)
        recent_moods = Mood.where(couple_id: couple.id)
                          .where('created_at >= ?', 7.days.ago)
                          .count
        recent_score = [(recent_moods.to_f / 14 * 30), 30].min
        
        (participation_score + consistency_score + recent_score).round
      end

      def calculate_rhs_trend
        # Compare last 7 days vs previous 7 days
        couple = current_user.couple
        return 'stable' unless couple
        
        current_week = Mood.where(couple_id: couple.id)
                          .where('created_at >= ?', 7.days.ago)
                          .count
        previous_week = Mood.where(couple_id: couple.id)
                          .where('created_at >= ?', 14.days.ago)
                          .where('created_at < ?', 7.days.ago)
                          .count
        
        if current_week > previous_week * 1.2
          'up'
        elsif current_week < previous_week * 0.8
          'down'
        else
          'stable'
        end
      end

      def calculate_rhs_variation
        # Calculate percentage change
        couple = current_user.couple
        return 0 unless couple
        
        current_week = Mood.where(couple_id: couple.id)
                          .where('created_at >= ?', 7.days.ago)
                          .count
        previous_week = Mood.where(couple_id: couple.id)
                          .where('created_at >= ?', 14.days.ago)
                          .where('created_at < ?', 7.days.ago)
                          .count
        
        return 0 if previous_week.zero?
        
        variation = ((current_week - previous_week).to_f / previous_week * 100).round
        [[variation, 50].min, -50].max
      end

      def calculate_rhs_breakdown
        couple = current_user.couple
        return default_breakdown unless couple
        
        {
          communication: calculate_communication_score(couple),
          moodConsistency: calculate_consistency_score(couple),
          qualityTime: calculate_quality_time_score(couple),
          streak: calculate_streak_score(couple)
        }
      end

      def default_breakdown
        {
          communication: 75,
          moodConsistency: 75,
          qualityTime: 75,
          streak: 75
        }
      end

      def calculate_communication_score(couple)
        # Based on mood check-ins with notes
        moods_with_notes = Mood.where(couple_id: couple.id)
                              .where('created_at >= ?', 30.days.ago)
                              .where.not(note: nil)
                              .where.not(note: '')
                              .count
        total_moods = Mood.where(couple_id: couple.id)
                         .where('created_at >= ?', 30.days.ago)
                         .count
        
        return 75 if total_moods.zero?
        
        [(moods_with_notes.to_f / total_moods * 100), 100].min.round
      end

      def calculate_consistency_score(couple)
        # Based on daily check-in consistency
        days_with_mood = Mood.where(couple_id: couple.id)
                            .where('created_at >= ?', 30.days.ago)
                            .select('DATE(created_at)')
                            .distinct
                            .count
        
        [(days_with_mood.to_f / 30 * 100), 100].min.round
      end

      def calculate_quality_time_score(couple)
        # Placeholder - would integrate with date tracking
        75
      end

      def calculate_streak_score(couple)
        # Calculate current streak
        today = Date.today
        streak = 0
        
        loop do
          date = today - streak.days
          has_mood = Mood.where(couple_id: couple.id)
                        .where(created_at: date.beginning_of_day..date.end_of_day)
                        .exists?
          break unless has_mood
          streak += 1
        end
        
        # Score based on streak (max 100 at 30 days)
        [streak * 3.33, 100].min.round
      end

      def ensure_has_couple
        unless current_user.couple
          render_error("User does not belong to a couple", status: :not_found)
        end
      end
    end
  end
end
