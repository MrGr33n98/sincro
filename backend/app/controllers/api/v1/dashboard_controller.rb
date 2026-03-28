# frozen_string_literal: true

module Api
  module V1
    class DashboardController < ApplicationController
      before_action :ensure_has_couple

      def show
        render json: {
          coupleId: current_user.couple_id,
          rhsScore: rhs_data,
          moodSync: mood_sync_data,
          aiConcierge: ai_concierge_data,
          stats: stats_data,
          isPro: current_user.is_pro
        }
      end

      private

      def rhs_data
        # Calculate Relationship Health Score
        streak = calculate_streak
        mood_consistency = calculate_mood_consistency
        communication = calculate_communication_level
        quality_time = calculate_quality_time

        # Weighted average
        score = (
          streak * 0.25 +
          mood_consistency * 0.25 +
          communication * 0.25 +
          quality_time * 0.25
        ).round

        {
          current: score,
          trend: score > 70 ? "up" : score < 40 ? "down" : "stable",
          variation: 5,
          breakdown: {
            communication: communication,
            moodConsistency: mood_consistency,
            qualityTime: quality_time,
            streak: streak
          }
        }
      end

      def mood_sync_data
        today_start = Time.zone.beginning_of_day
        today_end = Time.zone.end_of_day

        my_mood = current_user.moods
                           .where(created_at: today_start..today_end)
                           .first

        partner_mood = Mood.where(couple_id: current_user.couple_id)
                           .where.not(user_id: current_user.id)
                           .where(created_at: today_start..today_end)
                           .first

        {
          user1: my_mood ? MoodSerializer.new(my_mood) : nil,
          user2: partner_mood ? MoodSerializer.new(partner_mood) : nil,
          bothCheckedIn: my_mood.present? && partner_mood.present?,
          aiInsight: nil
        }
      end

      def ai_concierge_data
        # Get next scheduled date or suggestion
        next_date = nil # TODO: Implement dates
        suggestion = nil

        {
          nextDate: next_date,
          suggestion: suggestion
        }
      end

      def stats_data
        {
          streakDays: calculate_streak,
          communicationLevel: calculate_communication_level_label,
          unresolvedConflicts: 0, # TODO: Implement conflicts
          weeklyQualityHours: rand(5..20) # TODO: Implement real calculation
        }
      end

      def calculate_streak
        # Count consecutive days with mood check-ins
        streak = 0
        current_date = Time.zone.today

        loop do
          mood = current_user.moods
                           .where(created_at: current_date.beginning_of_day..current_date.end_of_day)
                           .first

          break unless mood

          streak += 1
          current_date -= 1.day
        end

        streak
      end

      def calculate_mood_consistency
        # Percentage of days with mood check-in in last 30 days
        total_days = 30
        days_with_mood = current_user.moods
                                     .where("created_at >= ?", 30.days.ago)
                                     .select("DATE(created_at)")
                                     .distinct
                                     .count

        ((days_with_mood.to_f / total_days) * 100).round
      end

      def calculate_communication_level
        # Based on AI chat usage and mood sync consistency
        [60, 75, 90].sample # TODO: Implement real calculation
      end

      def calculate_communication_level_label
        level = calculate_communication_level
        if level >= 75
          "high"
        elsif level >= 50
          "medium"
        else
          "low"
        end
      end

      def calculate_quality_time
        # TODO: Implement real calculation based on shared activities
        [65, 70, 80, 85].sample
      end

      def ensure_has_couple
        unless current_user.couple
          render_error("User does not belong to a couple", status: :not_found)
        end
      end
    end
  end
end
