# frozen_string_literal: true

class ConversationWithMessagesSerializer < ActiveModel::Serializer
  attributes :id, :title, :context, :messages, :created_at, :updated_at

  def messages
    ActiveModelSerializers::SerializableResource.new(
      object.messages.order(created_at: :asc),
      each_serializer: MessageSerializer
    )
  end
end
