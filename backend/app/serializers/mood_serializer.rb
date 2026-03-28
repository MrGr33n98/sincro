# frozen_string_literal: true

class MoodSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :user_name, :mood, :note, :created_at

  def user_name
    object.user&.name
  end
end
