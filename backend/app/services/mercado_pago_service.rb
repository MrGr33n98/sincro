# frozen_string_literal: true

class MercadoPagoService
  def initialize
    @access_token = ENV['MERCADOPAGO_ACCESS_TOKEN']
    @client_id = ENV['MERCADOPAGO_CLIENT_ID']
    
    # SDK do MercadoPago (se disponível) ou chamadas HTTP diretas
    @base_url = 'https://api.mercadopago.com'
  end

  # Create PIX payment
  def create_pix_payment(user:, amount:, description: 'Sincronia Pro - Assinatura Mensal')
    return error_response('MercadoPago credentials not configured') unless @access_token

    payment_data = {
      transaction_amount: amount.to_f,
      description: description,
      payment_method_id: 'pix',
      payer: {
        email: user.email,
        identification: {
          type: 'CPF',
          number: '00000000000' # Should be collected from user
        }
      }
    }

    response = make_request('/v1/payments', payment_data)
    
    if response[:success]
      {
        success: true,
        payment_id: response[:data][:id],
        pix_code: response[:data][:point_of_interaction][:transaction_data][:ticket_qr_code],
        qr_code_base64: response[:data][:point_of_interaction][:transaction_data][:qr_code_base64],
        expires_at: response[:data][:expiration_date]
      }
    else
      error_response(response[:message])
    end
  rescue StandardError => e
    Rails.logger.error "[MercadoPago] Error creating PIX payment: #{e.message}"
    error_response(e.message)
  end

  # Check payment status
  def check_payment_status(payment_id)
    return error_response('MercadoPago credentials not configured') unless @access_token

    response = make_request("/v1/payments/#{payment_id}", {}, :get)
    
    if response[:success]
      {
        success: true,
        status: response[:data][:status], # approved, pending, rejected, cancelled, refunded, charged_back
        status_detail: response[:data][:status_detail],
        transaction_amount: response[:data][:transaction_amount],
        date_approved: response[:data][:date_approved]
      }
    else
      error_response(response[:message])
    end
  rescue StandardError => e
    Rails.logger.error "[MercadoPago] Error checking payment status: #{e.message}"
    error_response(e.message)
  end

  # Verify PIX payment (webhook callback)
  def verify_webhook_payment(payload, signature)
    # Verify webhook signature
    return false unless valid_webhook_signature?(payload, signature)

    data = JSON.parse(payload, symbolize_names: true)
    
    {
      payment_id: data[:data][:id],
      action: data[:action], # payment.created, payment.updated
      status: data[:data][:status],
      user_id: data[:data][:payer][:id]
    }
  rescue StandardError => e
    Rails.logger.error "[MercadoPago] Error verifying webhook: #{e.message}"
    nil
  end

  # Create subscription (preference)
  def create_subscription_preference(user:, plan: 'monthly')
    plans = {
      'monthly' => { amount: 19.90, title: 'Sincronia Pro - Mensal' },
      'yearly' => { amount: 199.90, title: 'Sincronia Pro - Anual (2 meses grátis)' }
    }
    
    plan_data = plans[plan] || plans['monthly']
    
    preference_data = {
      items: [
        {
          title: plan_data[:title],
          quantity: 1,
          unit_price: plan_data[:amount]
        }
      ],
      back_urls: {
        success: "#{ENV['NEXT_PUBLIC_SITE_URL']}/upgrade/success",
        failure: "#{ENV['NEXT_PUBLIC_SITE_URL']}/upgrade/failure",
        pending: "#{ENV['NEXT_PUBLIC_SITE_URL']}/upgrade/pending"
      },
      auto_return: 'approved',
      notification_url: "#{ENV['NEXT_PUBLIC_API_URL']}/webhooks/mercado_pago",
      metadata: {
        user_id: user.id,
        plan: plan
      }
    }

    response = make_request('/checkout/preferences', preference_data)
    
    if response[:success]
      {
        success: true,
        preference_id: response[:data][:id],
        init_point: response[:data][:init_point] # URL para checkout
      }
    else
      error_response(response[:message])
    end
  rescue StandardError => e
    Rails.logger.error "[MercadoPago] Error creating subscription preference: #{e.message}"
    error_response(e.message)
  end

  private

  def make_request(path, data, method = :post)
    headers = {
      'Authorization' => "Bearer #{@access_token}",
      'Content-Type' => 'application/json',
      'X-Idempotency-Key' => SecureRandom.uuid if method == :post
    }

    url = "#{@base_url}#{path}"
    
    response = case method
               when :post
                 HTTParty.post(url, headers: headers, body: data.to_json)
               when :get
                 HTTParty.get(url, headers: headers)
               when :put
                 HTTParty.put(url, headers: headers, body: data.to_json)
               end

    if response.success?
      { success: true, data: response.parsed_response.symbolize_keys }
    else
      { success: false, message: response.parsed_response.dig('message') || 'Unknown error' }
    end
  end

  def valid_webhook_signature?(payload, signature)
    # Implement signature verification if needed
    # For now, accept all webhooks (NOT RECOMMENDED for production)
    true
  end

  def error_response(message)
    {
      success: false,
      error: message
    }
  end
end
