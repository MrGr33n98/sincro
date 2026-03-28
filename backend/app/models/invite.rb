# frozen_string_literal: true

class Invite < ApplicationRecord
  # Associations
  belongs_to :inviter, class_name: "User"
  belongs_to :couple, optional: true

  # Validations
  validates :token, presence: true, uniqueness: true
  validate :not_expired

  # Scopes
  scope :active, -> { where(used: false).where(expires_at: Time.zone.today..) }
  scope :expired, -> { where(expires_at: ...Time.zone.today) }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def expired?
    expires_at < Time.zone.now
  end

  def used?
    used
  end

  private

  def not_expired
    errors.add(:expires_at, "has already expired") if expired?
  end
end
