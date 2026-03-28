class CreateMessages < ActiveRecord::Migration[7.0]
  def change
    create_table :messages do |t|
      t.references :conversation, null: false, index: true
      t.string :role, null: false
      t.text :content, null: false

      t.timestamps
    end

    add_index :messages, :created_at
  end
end
