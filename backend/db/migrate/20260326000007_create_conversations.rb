class CreateConversations < ActiveRecord::Migration[7.0]
  def change
    create_table :conversations do |t|
      t.references :user, null: false, index: true
      t.string :title
      t.text :context

      t.timestamps
    end
  end
end
