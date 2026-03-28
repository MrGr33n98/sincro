# frozen_string_literal: true

module Api
  module V1
    module Openai
      class ConversationsController < ApplicationController
        def index
          conversations = current_user.conversations.order(updated_at: :desc)

          render json: ActiveModelSerializers::SerializableResource.new(
            conversations,
            each_serializer: ConversationSerializer
          )
        end

        def create
          conversation = current_user.conversations.create!(
            title: conversation_params[:title] || "Nova conversa",
            context: conversation_params[:context] || ""
          )

          render json: ActiveModelSerializers::SerializableResource.new(
            conversation,
            serializer: ConversationSerializer
          ), status: :created
        end

        def show
          conversation = current_user.conversations.find_by!(id: params[:id])

          render json: ActiveModelSerializers::SerializableResource.new(
            conversation,
            serializer: ConversationWithMessagesSerializer
          )
        end

        def send_message
          conversation = current_user.conversations.find_by!(id: params[:id])
          content = message_params[:content]

          return render_error("Content is required", status: :bad_request) unless content

          # Create user message
          conversation.messages.create!(
            role: "user",
            content: content
          )

          # Generate response using OpenAI (streaming)
          response_content = generate_openai_response(conversation, content)

          # Create assistant message
          assistant_message = conversation.messages.create!(
            role: "assistant",
            content: response_content
          )

          # Update conversation updated_at
          conversation.touch

          render json: ActiveModelSerializers::SerializableResource.new(
            assistant_message,
            serializer: MessageSerializer
          )
        end

        private

        def conversation_params
          params.permit(:title, :context)
        end

        def message_params
          params.permit(:content)
        end

        def generate_openai_response(conversation, user_message)
          # TODO: Integrate with OpenAI API
          # For now, return a mock response
          "Entendo que você está passando por isso. Como casal, é importante lembrar que a comunicação é fundamental. Você já tentou expressar seus sentimentos de forma calma e assertiva? Posso te ajudar a formular uma mensagem usando comunicação não-violenta."
        end
      end
    end
  end
end
