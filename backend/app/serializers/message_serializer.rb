# frozen_string_literal: true

class MessageSerializer < ActiveModel::Serializer
  attributes :id, :role, :content, :created_at
end
