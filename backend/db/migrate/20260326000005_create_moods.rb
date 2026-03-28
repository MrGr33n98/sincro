class CreateMoods < ActiveRecord::Migration[7.0]
  def change
    create_table :moods do |t|
      t.references :user, null: false, foreign_key: true
      t.references :couple, null: false, foreign_key: true
      t.string :mood, null: false
      t.text :note

      t.timestamps
    end

    add_index :moods, :created_at
    add_index :moods, [:couple_id, :created_at]
  end
end
