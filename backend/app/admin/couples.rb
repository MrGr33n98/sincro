ActiveAdmin.register Couple, as: "Couple" do
  permit_params :cover_photo_url, :anniversary_date

  index do
    selectable_column
    id_column
    column :user1, ->(c) { c.user1&.name || "N/A" }
    column :user2, ->(c) { c.user2&.name || "N/A" }
    column :anniversary_date
    column :relationship_days
    column :created_at
    actions
  end

  filter :id
  filter :anniversary_date
  filter :created_at

  show do
    attributes_table do
      row :id
      row :user1
      row :user2
      row :cover_photo_url
      row :anniversary_date
      row :relationship_days
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Couple Details" do
      f.input :user1
      f.input :user2
      f.input :cover_photo_url
      f.input :anniversary_date, as: :date_picker
    end
    f.actions
  end

  # Sidebar stats
  sidebar "Stats", only: :index do
    ul do
      li "Total Couples: #{Couple.count}"
      li "Active Today: #{Couple.joins(:moods).where(moods: { created_at: Time.zone.beginning_of_day..Time.zone.end_of_day }).distinct.count}"
    end
  end
end
