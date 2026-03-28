# frozen_string_literal: true

class Message < ApplicationRecord
  # Associations
  belongs_to :conversation

  # Validations
  validates :role, presence: true
  validates :role, inclusion: { in: %w[user assistant system] }
  validates :content, presence: true

  # PaperTrail
  has_paper_trail

  # Scopes
  scope :by_role, ->(role) { where(role: role) }

  # Instance methods
  def user_message?
    role == "user"
  end

  def assistant_message?
    role == "assistant"
  end
end
