# frozen_string_literal: true

class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :avatar_url, :couple_id, :is_pro, :pro_expires_at, :created_at

  attribute :avatar_initials, if: :avatar_initials?

  def avatar_initials
    object.name.split.map(&:first).join("").upcase[0..2]
  end

  def avatar_initials?
    object.name.present?
  end
end
