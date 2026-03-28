ActiveAdmin.register User, as: "User" do
  permit_params :name, :email, :password, :password_confirmation, :avatar_url, :couple_id, :is_pro, :pro_expires_at

  index do
    selectable_column
    id_column
    column :name
    column :email
    column :couple
    column :is_pro
    column :pro_expires_at
    column :created_at
    actions
  end

  filter :email
  filter :name
  filter :is_pro
  filter :couple
  filter :created_at

  show do
    attributes_table do
      row :name
      row :email
      row :avatar_url
      row :couple
      row :is_pro
      row :pro_expires_at
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "User Details" do
      f.input :name
      f.input :email
      f.input :password
      f.input :password_confirmation
      f.input :avatar_url
      f.input :couple
      f.input :is_pro
      f.input :pro_expires_at, as: :date_picker
    end
    f.actions
  end

  # Batch actions
  batch_action :make_pro do |ids|
    batch_action_collection.find(ids).each do |user|
      user.update!(is_pro: true, pro_expires_at: 1.year.from_now)
    end
    redirect_to collection_path, notice: "Users upgraded to Pro."
  end

  batch_action :remove_pro do |ids|
    batch_action_collection.find(ids).each do |user|
      user.update!(is_pro: false, pro_expires_at: nil)
    end
    redirect_to collection_path, notice: "Pro status removed."
  end

  # Scopes
  scope :all, default: true
  scope :pro_users, -> { where(is_pro: true) }
  scope :free_users, -> { where(is_pro: false) }

  # Sidebar stats
  sidebar "Stats", only: :index do
    ul do
      li "Total Users: #{User.count}"
      li "Pro Users: #{User.where(is_pro: true).count}"
      li "Free Users: #{User.where(is_pro: false).count}"
    end
  end
end
