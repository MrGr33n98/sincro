ActiveAdmin.register Mood, as: "Mood Entry" do
  permit_params :user_id, :couple_id, :mood, :note

  index do
    selectable_column
    id_column
    column :user
    column :couple
    column :mood
    column :note
    column :created_at
    actions
  end

  filter :user
  filter :couple
  filter :mood
  filter :created_at

  show do
    attributes_table do
      row :id
      row :user
      row :couple
      row :mood
      row :note
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Mood Details" do
      f.input :user
      f.input :couple
      f.input :mood, as: :select, collection: %w[happy excited calm focused tired stressed sad anxious romantic playful]
      f.input :note
    end
    f.actions
  end

  # Scopes
  scope :all, default: true
  scope :today, -> { where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day) }

  # Sidebar
  sidebar "Mood Distribution", only: :index do
    panel "Today's Moods" do
      ul do
        Mood.where(created_at: Time.zone.beginning_of_day..Time.zone.end_of_day)
            .group(:mood)
            .count
            .sort_by { |_, v| -v }
            .each do |mood, count|
              li "#{mood}: #{count}"
            end
      end
    end
  end
end
