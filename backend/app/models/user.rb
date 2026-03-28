# frozen_string_literal: true

class User < ApplicationRecord
  # Devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :trackable

  # Associations
  belongs_to :couple, optional: true
  has_many :invites, foreign_key: :inviter_id, dependent: :destroy
  has_many :moods, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  has_many :conversations, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true

  # Scopes
  scope :pro, -> { where(is_pro: true, pro_expires_at: Time.zone.today..) }
  scope :free, -> { where(is_pro: false).or(where(pro_expires_at: ...Time.zone.today)) }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def active_for_authentication?
    super && !couple.nil?
  end

  def inactive_message
    couple.nil? ? :no_couple : super
  end

  def pro?
    is_pro? && (pro_expires_at.nil? || pro_expires_at > Time.zone.today)
  end

  def avatar_initials
    name.split.map(&:first).join("").upcase[0..2]
  end

  def active_mood_today?
    moods.where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day).exists?
  end

  def current_streak
    return 0 unless couple

    streak = 0
    today = Date.today

    loop do
      date = today - streak.days
      has_mood = moods.where(created_at: date.beginning_of_day..date.end_of_day).exists?
      break unless has_mood
      streak += 1
    end

    streak
  end

  def partner
    return nil unless couple

    couple.user1_id == id ? couple.user2 : couple.user1
  end
end
