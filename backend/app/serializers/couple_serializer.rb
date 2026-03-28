# frozen_string_literal: true

class CoupleSerializer < ActiveModel::Serializer
  attributes :id, :user1, :user2, :anniversary_date, :relationship_days, :cover_photo_url, :created_at

  def user1
    ActiveModelSerializers::SerializableResource.new(object.user1, serializer: UserSerializer)
  end

  def user2
    ActiveModelSerializers::SerializableResource.new(object.user2, serializer: UserSerializer)
  end

  def relationship_days
    object.relationship_days
  end
end
