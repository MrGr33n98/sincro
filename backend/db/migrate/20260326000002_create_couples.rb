class CreateCouples < ActiveRecord::Migration[7.0]
  def change
    create_table :couples do |t|
      t.bigint :user1_id, null: false
      t.bigint :user2_id, null: false
      t.string :cover_photo_url
      t.date :anniversary_date

      t.timestamps
    end

    add_index :couples, :user1_id
    add_index :couples, :user2_id
  end
end
