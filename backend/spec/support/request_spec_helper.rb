# frozen_string_literal: true

module RequestSpecHelper
  # Parse JSON response
  def json_response
    JSON.parse(response.body)
  end

  # Create authenticated user for requests
  def create_authenticated_user
    user = User.create!(
      name: 'Test User',
      email: Faker::Internet.email,
      password: 'password123',
      password_confirmation: 'password123'
    )
    sign_in user
    user
  end

  # Create user and couple
  def create_user_with_couple
    user1 = User.create!(
      name: 'User One',
      email: Faker::Internet.email,
      password: 'password123',
      password_confirmation: 'password123'
    )
    
    user2 = User.create!(
      name: 'User Two',
      email: Faker::Internet.email,
      password: 'password123',
      password_confirmation: 'password123'
    )
    
    couple = Couple.create!(
      user1_id: user1.id,
      user2_id: user2.id,
      anniversary_date: 1.year.ago.to_date
    )
    
    user1.update!(couple_id: couple.id)
    user2.update!(couple_id: couple.id)
    
    { user1: user1, user2: user2, couple: couple }
  end

  # Create mood entries
  def create_mood_entries(couple_id, count: 7)
    users = User.where(couple_id: couple_id).to_a
    return [] if users.empty?
    
    count.times.map do |i|
      Mood.create!(
        user: users[i % users.length],
        couple_id: couple_id,
        mood: %w[happy sad excited tired romantic stressed].sample,
        note: "Test mood note #{i}",
        created_at: i.days.ago.beginning_of_day + rand(8..20).hours
      )
    end
  end

  # Generate auth headers
  def auth_headers(user)
    payload = {
      sub: user.id,
      email: user.email,
      exp: 7.days.from_now.to_i
    }
    
    token = JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
    { 'Authorization' => "Bearer #{token}" }
  end
end
