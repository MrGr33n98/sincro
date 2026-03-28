# frozen_string_literal: true

class Conversation < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :messages, dependent: :destroy

  # Validations
  validates :title, length: { maximum: 100 }

  # PaperTrail
  has_paper_trail

  # Instance methods
  def last_message
    messages.order(created_at: :desc).first
  end

  def message_count
    messages.count
  end
end
