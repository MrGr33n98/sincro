# frozen_string_literal: true

module Api
  module V1
    class SubscriptionsController < ApplicationController
      before_action :initialize_mercado_pago_service, only: [:upgrade]

      def status
        subscription = current_user.subscriptions&.last || nil

        render json: {
          isPro: current_user.is_pro,
          plan: current_user.is_pro ? "pro" : "free",
          expiresAt: current_user.pro_expires_at,
          subscription: subscription ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            amount: subscription.amount,
            createdAt: subscription.created_at,
            expiresAt: subscription.expires_at
          } : nil,
          features: current_user.is_pro ? [
            "Sugestões de date ilimitadas",
            "Mediação de conflitos por IA",
            "AI Concierge chat ilimitado",
            "Timeline emocional avançada",
            "Nudges de carinho personalizados",
            "Dashboard com análise profunda"
          ] : [
            "Mood tracker diário",
            "Dashboard do casal",
            "3 sugestões de date/mês",
            "Relationship Health Score"
          ]
        }
      end

      def upgrade
        plan = params[:plan] || "monthly"

        # Calculate amount
        amount = plan == "monthly" ? 19.90 : 199.90

        # Generate PIX payment via MercadoPago
        mp_response = @mercado_pago_service.create_pix_payment(
          user: current_user,
          amount: amount,
          description: "Sincronia Pro - #{plan == 'monthly' ? 'Mensal' : 'Anual'}"
        )

        if mp_response[:success]
          # Create/update subscription record
          subscription = current_user.subscriptions.find_or_initialize_by(payment_id: mp_response[:payment_id])
          subscription.update!(
            plan: plan,
            pix_code: mp_response[:pix_code],
            amount: amount,
            status: "pending",
            expires_at: mp_response[:expires_at] || 1.hour.from_now
          )

          render json: {
            pixCode: mp_response[:pix_code],
            pixQrCode: "data:image/png;base64,#{mp_response[:qr_code_base64]}",
            amount: amount,
            expiresAt: subscription.expires_at,
            paymentId: mp_response[:payment_id],
            success: true
          }, status: :created
        else
          render json: {
            error: true,
            message: mp_response[:error] || "Failed to generate PIX payment"
          }, status: :internal_server_error
        end
      end

      def webhook
        # Verify webhook payload
        payload = request.body.read
        signature = request.headers['X-Signature']
        
        mp_response = @mercado_pago_service.verify_webhook_payment(payload, signature)
        
        return head :bad_request unless mp_response
        
        # Process payment update
        payment_id = mp_response[:payment_id]
        status = mp_response[:status]
        
        subscription = Subscription.find_by(payment_id: payment_id)
        
        if subscription && status == 'approved'
          # Activate subscription
          user = subscription.user
          user.update!(
            is_pro: true,
            pro_expires_at: subscription.plan == 'yearly' ? 1.year.from_now : 1.month.from_now
          )
          subscription.update!(status: 'paid')
          
          Rails.logger.info "[MercadoPago] Subscription activated for user #{user.id}"
        end
        
        head :ok
      rescue StandardError => e
        Rails.logger.error "[MercadoPago] Webhook error: #{e.message}"
        head :internal_server_error
      end

      private

      def initialize_mercado_pago_service
        @mercado_pago_service = MercadoPagoService.new
      end
    end
  end
end
