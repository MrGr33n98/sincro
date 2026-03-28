ActiveAdmin.register AdminUser do
  permit_params :email, :password, :password_confirmation, :name, :active, :super_admin

  index do
    selectable_column
    id_column
    column :name
    column :email
    column :active
    column :super_admin
    column :sign_in_count
    column :current_sign_in_at
    column :created_at
    actions
  end

  filter :email
  filter :name
  filter :active
  filter :super_admin
  filter :created_at

  show do
    attributes_table do
      row :name
      row :email
      row :active
      row :super_admin
      row :sign_in_count
      row :current_sign_in_at
      row :last_sign_in_at
      row :current_sign_in_ip
      row :last_sign_in_ip
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Admin Details" do
      f.input :name
      f.input :email
      f.input :password
      f.input :password_confirmation
      f.input :active
      f.input :super_admin
    end
    f.actions
  end

  # Batch actions
  batch_action :activate, if: proc { params[:scope] != "inactive" } do |ids|
    batch_action_collection.find(ids).each(&:update!(active: true))
    redirect_to collection_path, notice: "The users have been activated."
  end

  batch_action :deactivate, if: proc { params[:scope] != "active" } do |ids|
    batch_action_collection.find(ids).each(&:update!(active: false))
    redirect_to collection_path, notice: "The users have been deactivated."
  end

  # Scopes
  scope :all, default: true
  scope :active
  scope :inactive
  scope :super_admins

  # Sidebar
  sidebar "Quick Actions", only: :show do
    ul do
      li link_to "Back to Users", admin_users_path
    end
  end
end
