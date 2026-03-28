# frozen_string_literal: true

class Mood < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :couple

  # Validations
  validates :mood, presence: true
  validates :mood, inclusion: {
    in: %w[happy excited calm focused tired stressed sad anxious romantic playful],
    message: "must be a valid mood"
  }

  # Scopes
  scope :today, -> { where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day) }
  scope :this_week, -> { where(created_at: 1.week.ago.beginning_of_day..Time.zone.end_of_day) }
  scope :this_month, -> { where(created_at: 1.month.ago.beginning_of_day..Time.zone.end_of_day) }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def emoji
    emojis = {
      "happy" => "😊",
      "excited" => "⚡",
      "calm" => "🌊",
      "focused" => "🎯",
      "tired" => "🔋",
      "stressed" => "😤",
      "sad" => "😢",
      "anxious" => "😰",
      "romantic" => "💕",
      "playful" => "🎉"
    }
    emojis[mood] || "🙂"
  end

  def label
    labels = {
      "happy" => "Feliz",
      "excited" => "Animado",
      "calm" => "Calmo",
      "focused" => "Focado",
      "tired" => "Cansado",
      "stressed" => "Estressado",
      "sad" => "Triste",
      "anxious" => "Ansioso",
      "romantic" => "Romântico",
      "playful" => "Divertido"
    }
    labels[mood] || mood.capitalize
  end
end
