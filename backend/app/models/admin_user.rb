# frozen_string_literal: true

class AdminUser < ApplicationRecord
  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true

  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :super_admins, -> { where(super_admin: true) }

  # Instance methods
  def active_for_authentication?
    active?
  end

  def inactive_message
    active? ? super : :inactive_account
  end

  def to_s
    name || email
  end

  # Password hashing (manual since we don't have Devise)
  def password=(plain_password)
    self.encrypted_password = BCrypt::Password.create(plain_password)
  end

  def valid_password?(password)
    BCrypt::Password.new(encrypted_password) == password
  end
end
