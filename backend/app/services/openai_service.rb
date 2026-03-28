# frozen_string_literal: true

class OpenAIService
  def initialize
    @client = OpenAI::Client.new(api_key: ENV['OPENAI_API_KEY'])
    @model = ENV.fetch('OPENAI_MODEL', 'gpt-4o-mini')
    @max_tokens = ENV.fetch('OPENAI_MAX_TOKENS', '1000').to_i
  end

  # Generate date suggestions based on budget, city, and preferences
  def generate_date_suggestions(budget:, city:, preferences: [], count: 3)
    prompt = build_date_suggestions_prompt(budget, city, preferences, count)
    
    response = @client.chat(
      parameters: {
        model: @model,
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em encontros românticos para casais brasileiros. Suas sugestões são criativas, práticas e personalizadas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: @max_tokens,
        temperature: 0.8
      }
    )
    
    parse_date_suggestions(response.dig('choices', 0, 'message', 'content'))
  rescue OpenAI::Error => e
    Rails.logger.error "[OpenAI] Error generating date suggestions: #{e.message}"
    fallback_date_suggestions(budget, city, count)
  end

  # Generate mediation message for conflict resolution
  def generate_mediation(concern:, context: nil)
    prompt = build_mediation_prompt(concern, context)
    
    response = @client.chat(
      parameters: {
        model: @model,
        messages: [
          {
            role: 'system',
            content: 'Você é um terapeuta de casais especializado em Comunicação Não-Violenta (CNV). Você ajuda a reformular mensagens de forma construtiva.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: @max_tokens,
        temperature: 0.7
      }
    )
    
    parse_mediation_response(response.dig('choices', 0, 'message', 'content'))
  rescue OpenAI::Error => e
    Rails.logger.error "[OpenAI] Error generating mediation: #{e.message}"
    fallback_mediation(concern)
  end

  # Generate AI insight for mood check-ins
  def generate_mood_insight(user_mood:, partner_mood:)
    prompt = "Meu humor: #{user_mood}. Humor do parceiro: #{partner_mood}. Dê uma sugestão curta e carinhosa de como conectar hoje."
    
    response = @client.chat(
      parameters: {
        model: @model,
        messages: [
          { role: 'system', content: 'Você é um assistente de relacionamento carinhoso. Responda em português do Brasil de forma curta (máx 2 frases).' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      }
    )
    
    response.dig('choices', 0, 'message', 'content')
  rescue OpenAI::Error => e
    Rails.logger.error "[OpenAI] Error generating mood insight: #{e.message}"
    nil
  end

  # Generate love letter
  def generate_love_letter(recipient_name:, occasion:, tone: 'romantic', length: 'medium')
    prompt = "Escreva uma carta de amor para #{recipient_name} em ocasião: #{occasion}. Tom: #{tone}. Tamanho: #{length}."
    
    response = @client.chat(
      parameters: {
        model: @model,
        messages: [
          { role: 'system', content: 'Você é um poeta romântico brasileiro. Escreva cartas de amor emocionantes e autênticas.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: @max_tokens,
        temperature: 0.9
      }
    )
    
    response.dig('choices', 0, 'message', 'content')
  rescue OpenAI::Error => e
    Rails.logger.error "[OpenAI] Error generating love letter: #{e.message}"
    nil
  end

  private

  def build_date_suggestions_prompt(budget, city, preferences, count)
    budget_labels = {
      'free' => 'gratuito',
      'low' => 'até R$ 100',
      'medium' => 'R$ 100-300',
      'high' => 'acima de R$ 300'
    }
    
    <<~PROMPT
      Sugira #{count} ideias de date para um casal em #{city}.
      
      Orçamento: #{budget_labels[budget] || budget}
      Preferências: #{preferences.join(', ').presence || 'nenhuma específica'}
      
      Para cada sugestão, inclua:
      - Título criativo
      - Descrição (2-3 frases)
      - Tipo (outdoor, indoor, gastronômico, cultural, aventura)
      - Nível de esforço (baixo, médio, alto)
      - Custo estimado em reais
      
      Responda em JSON array no formato:
      [
        {
          "title": "...",
          "description": "...",
          "type": "...",
          "effortLevel": "...",
          "estimatedCost": "..."
        }
      ]
    PROMPT
  end

  def parse_date_suggestions(content)
    return fallback_date_suggestions('medium', 'São Paulo', 3) unless content
    
    # Try to extract JSON from response
    json_match = content.match(/\[.*\]/m)
    return fallback_date_suggestions('medium', 'São Paulo', 3) unless json_match
    
    JSON.parse(json_match[0]).map do |suggestion|
      {
        title: suggestion['title'] || 'Date Especial',
        description: suggestion['description'] || 'Uma experiência única para vocês dois.',
        type: suggestion['type'] || 'indoor',
        effortLevel: suggestion['effortLevel'] || 'medium',
        estimatedCost: suggestion['estimatedCost'] || 'R$ 100-200',
        location: 'A combinar'
      }
    end
  rescue JSON::ParserError
    fallback_date_suggestions('medium', 'São Paulo', 3)
  end

  def build_mediation_prompt(concern, context)
    <<~PROMPT
      Preciso de ajuda para comunicar uma preocupação no meu relacionamento.
      
      Preocupação: #{concern}
      #{context.present? ? "Contexto adicional: #{context}" : ''}
      
      Por favor, gere:
      1. Uma mensagem reformulada usando Comunicação Não-Violenta (CNV)
      2. 4-5 sugestões práticas de como abordar a conversa
      3. O tom recomendado (amoroso, assertivo, compreensivo, etc)
      4. 4 dicas para a conversa
      
      Responda em JSON no formato:
      {
        "reframedMessage": "...",
        "suggestions": ["...", "..."],
        "tone": "...",
        "tips": ["...", "...", "...", "..."]
      }
    PROMPT
  end

  def parse_mediation_response(content)
    return fallback_mediation('preocupação') unless content
    
    # Try to extract JSON from response
    json_match = content.match(/\{.*\}/m)
    return fallback_mediation('preocupação') unless json_match
    
    JSON.parse(json_match[0])
  rescue JSON::ParserError
    fallback_mediation('preocupação')
  end

  def fallback_date_suggestions(budget, city, count)
    [
      {
        title: 'Piquenique romântico no parque',
        description: 'Um piquenique intimista com comidas leves e vinho. Perfeito para conversar e aproveitar o dia.',
        type: 'outdoor',
        effortLevel: 'low',
        estimatedCost: budget == 'free' ? 'Gratuito' : 'R$ 50-100',
        location: city
      },
      {
        title: 'Noite de cinema em casa',
        description: 'Selecione 3 filmes que ambos querem assistir, prepare pipocas gourmet e crie um ambiente aconchegante.',
        type: 'indoor',
        effortLevel: 'low',
        estimatedCost: 'R$ 30-50',
        location: 'Em casa'
      },
      {
        title: 'Jantar em restaurante novo',
        description: 'Experimentem um restaurante que nunca foram. A novidade traz emoção e ótimos assuntos para conversar.',
        type: 'gastronomic',
        effortLevel: 'medium',
        estimatedCost: 'R$ 150-300',
        location: city
      }
    ].take(count)
  end

  def fallback_mediation(concern)
    {
      suggestions: [
        'Comece expressando como você se sente, sem culpar o outro.',
        'Use frases como "Eu me sinto..." em vez de "Você sempre...".',
        'Escolha um momento calmo para conversar, não durante um conflito.',
        'Ouça ativamente antes de responder.'
      ],
      reframedMessage: "Eu tenho sentido que precisamos de mais tempo de qualidade juntos, e isso é importante para mim porque me faz sentir conectado(a) com você. Podemos conversar sobre como podemos priorizar isso?",
      tone: 'amoroso e assertivo',
      tips: [
        'Respire fundo antes de iniciar a conversa',
        'Valide os sentimentos do outro, mesmo que discorde',
        'Foque em soluções, não em problemas',
        'Lembre-se: vocês dois estão do mesmo lado'
      ]
    }
  end
end
