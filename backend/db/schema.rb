# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2026_03_26_000008) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "admin_users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.boolean "active", default: true, null: false
    t.boolean "super_admin", default: false, null: false
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.text "context"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_conversations_on_user_id"
  end

  create_table "couples", force: :cascade do |t|
    t.bigint "user1_id", null: false
    t.bigint "user2_id", null: false
    t.string "cover_photo_url"
    t.date "anniversary_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user1_id"], name: "index_couples_on_user1_id"
    t.index ["user2_id"], name: "index_couples_on_user2_id"
  end

  create_table "invites", force: :cascade do |t|
    t.string "token", null: false
    t.bigint "inviter_id", null: false
    t.bigint "couple_id"
    t.boolean "used", default: false, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id"], name: "index_invites_on_couple_id"
    t.index ["expires_at"], name: "index_invites_on_expires_at"
    t.index ["inviter_id"], name: "index_invites_on_inviter_id"
    t.index ["token"], name: "index_invites_on_token", unique: true
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.string "role", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["created_at"], name: "index_messages_on_created_at"
  end

  create_table "moods", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "couple_id", null: false
    t.string "mood", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id", "created_at"], name: "index_moods_on_couple_id_and_created_at"
    t.index ["couple_id"], name: "index_moods_on_couple_id"
    t.index ["created_at"], name: "index_moods_on_created_at"
    t.index ["user_id"], name: "index_moods_on_user_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "plan", null: false
    t.string "payment_id"
    t.text "pix_code"
    t.decimal "amount", precision: 10, scale: 2
    t.string "status", default: "pending", null: false
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_subscriptions_on_expires_at"
    t.index ["status"], name: "index_subscriptions_on_status"
    t.index ["user_id"], name: "index_subscriptions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "avatar_url"
    t.bigint "couple_id"
    t.boolean "is_pro", default: false, null: false
    t.datetime "pro_expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id"], name: "index_users_on_couple_id"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "invites", "couples"
  add_foreign_key "invites", "users", column: "inviter_id"
  add_foreign_key "moods", "couples"
  add_foreign_key "moods", "users"
  add_foreign_key "subscriptions", "users"
end
