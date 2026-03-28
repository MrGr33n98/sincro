class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :encrypted_password, null: false
      t.string :avatar_url
      t.bigint :couple_id, null: true
      t.boolean :is_pro, default: false, null: false
      t.datetime :pro_expires_at

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :couple_id
  end
end
