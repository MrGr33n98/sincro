class CreateInvites < ActiveRecord::Migration[7.0]
  def change
    create_table :invites do |t|
      t.string :token, null: false
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.references :couple, null: true, foreign_key: true
      t.boolean :used, default: false, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :invites, :token, unique: true
    add_index :invites, :expires_at
  end
end
