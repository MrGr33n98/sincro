class CreateSubscriptions < ActiveRecord::Migration[7.0]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :plan, null: false
      t.string :payment_id
      t.text :pix_code
      t.decimal :amount, precision: 10, scale: 2
      t.string :status, default: "pending", null: false
      t.datetime :expires_at

      t.timestamps
    end

    add_index :subscriptions, :status
    add_index :subscriptions, :expires_at
  end
end
