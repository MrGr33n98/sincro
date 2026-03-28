# frozen_string_literal: true

class Subscription < ApplicationRecord
  # Associations
  belongs_to :user

  # Validations
  validates :plan, presence: true
  validates :plan, inclusion: { in: %w[free pro monthly annual] }
  validates :status, presence: true
  validates :status, inclusion: { in: %w[pending paid expired cancelled refunded] }

  # Scopes
  scope :active, -> { where(status: "paid").where(expires_at: Time.zone.today..) }
  scope :expired, -> { where(status: "paid").where(expires_at: ...Time.zone.today) }
  scope :pending, -> { where(status: "pending") }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def active?
    status == "paid" && expires_at > Time.zone.today
  end

  def expired?
    expires_at && expires_at < Time.zone.today
  end
end
