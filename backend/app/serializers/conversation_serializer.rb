# frozen_string_literal: true

class ConversationSerializer < ActiveModel::Serializer
  attributes :id, :title, :context, :created_at, :updated_at
end
