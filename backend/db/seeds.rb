# frozen_string_literal: true

# ═══════════════════════════════════════════════════════════════════
# Sincronia — Database Seeds
# ═══════════════════════════════════════════════════════════════════

puts "🌱 Seeding database..."

# ───────────────────────────────────────────────────────────────────
# Admin User (ActiveAdmin)
# ───────────────────────────────────────────────────────────────────
puts "Creating admin user..."

admin_user = AdminUser.find_or_initialize_by(email: ENV.fetch("ADMIN_EMAIL", "admin@sincronia.app")) do |user|
  user.name = "Admin Sincronia"
  user.active = true
  user.super_admin = true
end

if admin_user.new_record? || admin_user.encrypted_password.nil?
  admin_user.password = ENV.fetch("ADMIN_PASSWORD", "Admin123!")
  admin_user.save!
end

puts "✅ Admin user created: #{admin_user.email}"

# ───────────────────────────────────────────────────────────────────
# Sample Users (for development)
# ───────────────────────────────────────────────────────────────────
puts "Creating sample users..."

user1 = User.find_or_create_by!(email: "felipe@test.com") do |user|
  user.name = "Felipe Silva"
  user.password = "123456"
  user.password_confirmation = user.password
end

user2 = User.find_or_create_by!(email: "lari@test.com") do |user|
  user.name = "Larissa Santos"
  user.password = "123456"
  user.password_confirmation = user.password
end

puts "✅ Sample users created: felipe@test.com, lari@test.com (password: 123456)"

# ───────────────────────────────────────────────────────────────────
# Couple
# ───────────────────────────────────────────────────────────────────
puts "Creating couple..."

couple = Couple.find_or_create_by!(user1_id: user1.id, user2_id: user2.id) do |c|
  c.anniversary_date = 1.year.ago.to_date
  c.cover_photo_url = nil
end

# Update users with couple_id
user1.update!(couple_id: couple.id)
user2.update!(couple_id: couple.id)

puts "✅ Couple created: #{user1.name} & #{user2.name}"

# ───────────────────────────────────────────────────────────────────
# Sample Moods (last 7 days)
# ───────────────────────────────────────────────────────────────────
puts "Creating sample moods..."

moods_list = [
  { mood: "happy", note: "Dia produtivo!" },
  { mood: "excited", note: "Ansioso para o date de hoje" },
  { mood: "calm", note: "Dia tranquilo" },
  { mood: "romantic", note: "Quero passar tempo com meu amor" },
  { mood: "tired", note: "Trabalho cansativo hoje" },
  { mood: "stressed", note: "Muitas reuniões" },
  { mood: "playful", note: "Vamos fazer algo divertido!" }
]

7.days.ago.to_date.upto(Date.today) do |date|
  next if Mood.where(user: user1, created_at: date.beginning_of_day..date.end_of_day).exists?

  mood_data = moods_list[rand(moods_list.length)]

  Mood.find_or_create_by!(
    user: user1,
    couple: couple,
    created_at: date.beginning_of_day + rand(8..20).hours
  ) do |m|
    m.mood = mood_data[:mood]
    m.note = mood_data[:note]
  end

  # Partner mood (sometimes)
  if rand > 0.3
    Mood.find_or_create_by!(
      user: user2,
      couple: couple,
      created_at: date.beginning_of_day + rand(8..20).hours
    ) do |m|
      m.mood = moods_list[rand(moods_list.length)][:mood]
      m.note = nil
    end
  end
end

puts "✅ Sample moods created for last 7 days"

# ───────────────────────────────────────────────────────────────────
# Subscription (Pro user)
# ───────────────────────────────────────────────────────────────────
puts "Creating subscription..."

user1.update!(is_pro: true, pro_expires_at: 1.year.from_now)

Subscription.find_or_create_by!(user: user1) do |sub|
  sub.plan = "monthly"
  sub.payment_id = "pay_sample_123"
  sub.amount = 19.90
  sub.status = "paid"
  sub.expires_at = 1.year.from_now
end

puts "✅ Subscription created for #{user1.name} (Pro user)"

# ───────────────────────────────────────────────────────────────────
# Invite (sample)
# ───────────────────────────────────────────────────────────────────
puts "Creating sample invite..."

Invite.find_or_create_by!(token: "sample_invite_token_123") do |invite|
  invite.inviter = user1
  invite.expires_at = 24.hours.from_now
  invite.used = false
end

puts "✅ Sample invite created"

# ───────────────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────────────
puts "\n" + "="*60
puts "🎉 Seeding completed!"
puts "="*60
puts "\n📊 Summary:"
puts "  - Admin Users: #{AdminUser.count}"
puts "  - Users: #{User.count}"
puts "  - Couples: #{Couple.count}"
puts "  - Moods: #{Mood.count}"
puts "  - Subscriptions: #{Subscription.count}"
puts "  - Invites: #{Invite.count}"
puts "\n🔐 Login credentials:"
puts "  Admin: #{admin_user.email} / #{ENV.fetch('ADMIN_PASSWORD', 'Admin123!')}"
puts "  User 1: felipe@test.com / 123456 (Pro)"
puts "  User 2: lari@test.com / 123456 (Free)"
puts "\n🌐 URLs:"
puts "  Frontend: http://localhost:3000"
puts "  Backend API: http://localhost:3001"
puts "  ActiveAdmin: http://localhost:3001/admin"
puts "="*60
