# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'password123' }
    password_confirmation { 'password123' }
    
    trait :pro do
      is_pro { true }
      pro_expires_at { 1.year.from_now }
    end
    
    trait :expired_pro do
      is_pro { true }
      pro_expires_at { 1.day.ago }
    end
  end

  factory :couple do
    association :user1, factory: :user
    association :user2, factory: :user
    
    anniversary_date { 1.year.ago.to_date }
    
    after(:create) do |couple, evaluator|
      couple.user1.update!(couple_id: couple.id)
      couple.user2.update!(couple_id: couple.id)
    end
  end

  factory :mood do
    association :user
    association :couple
    
    mood { %w[happy sad excited tired romantic stressed calm anxious playful].sample }
    note { Faker::Lorem.sentence }
    created_at { Time.zone.now }
  end

  factory :invite do
    association :inviter, factory: :user
    association :couple
    
    token { SecureRandom.uuid }
    expires_at { 24.hours.from_now }
    used { false }
  end

  factory :subscription do
    association :user
    
    plan { 'monthly' }
    payment_id { "pay_#{SecureRandom.uuid}" }
    pix_code { "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000" }
    amount { 19.90 }
    status { 'pending' }
    expires_at { 1.hour.from_now }
  end

  factory :conversation do
    association :user
    
    title { Faker::Lorem.sentence }
    context { Faker::Lorem.paragraph }
  end

  factory :message do
    association :conversation
    
    role { %w[user assistant system].sample }
    content { Faker::Lorem.paragraph }
  end

  factory :admin_user do
    sequence(:name) { |n| "Admin #{n}" }
    sequence(:email) { |n| "admin#{n}@example.com" }
    password { 'Admin123!' }
    password_confirmation { 'Admin123!' }
    active { true }
    super_admin { false }
  end
end
