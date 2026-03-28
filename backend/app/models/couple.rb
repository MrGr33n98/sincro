# frozen_string_literal: true

class Couple < ApplicationRecord
  # Associations
  belongs_to :user1, class_name: "User"
  belongs_to :user2, class_name: "User"
  has_many :moods, dependent: :destroy
  has_many :invites, dependent: :destroy

  # Validations
  validates :user1_id, uniqueness: { scope: :user2_id }
  validate :users_cannot_be_same

  # Scopes
  scope :active, -> { joins(:moods).where(moods: { created_at: 7.days.ago.. }).distinct }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def relationship_days
    return 0 unless anniversary_date

    (Time.zone.today - anniversary_date).to_i
  end

  def users
    [user1, user2]
  end

  def both_users
    [user1, user2]
  end

  def today_moods
    moods.where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day)
  end

  def both_checked_in_today?
    today_moods.group(:user_id).count.keys.length == 2
  end

  def days_since_creation
    return 0 unless created_at

    (Time.zone.today - created_at.to_date).to_i
  end

  private

  def users_cannot_be_same
    errors.add(:user2, "must be different from user1") if user1_id == user2_id
  end
end
