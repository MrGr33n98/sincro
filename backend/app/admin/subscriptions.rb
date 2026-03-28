ActiveAdmin.register Subscription, as: "Subscription" do
  permit_params :user_id, :plan, :payment_id, :pix_code, :amount, :status, :expires_at

  index do
    selectable_column
    id_column
    column :user
    column :plan
    column :status
    column :amount
    column :expires_at
    column :created_at
    actions
  end

  filter :user
  filter :plan
  filter :status
  filter :created_at

  show do
    attributes_table do
      row :id
      row :user
      row :plan
      row :payment_id
      row :pix_code
      row :amount
      row :status
      row :expires_at
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Subscription Details" do
      f.input :user
      f.input :plan, as: :select, collection: %w[free pro monthly annual]
      f.input :payment_id
      f.input :pix_code
      f.input :amount
      f.input :status, as: :select, collection: %w[pending paid expired cancelled refunded]
      f.input :expires_at, as: :date_picker
    end
    f.actions
  end

  # Scopes
  scope :all, default: true
  scope :active, -> { where(status: "paid", expires_at: Time.zone.today..) }
  scope :expired, -> { where("expires_at < ?", Time.zone.today) }
  scope :pending, -> { where(status: "pending") }

  # Sidebar stats
  sidebar "Revenue", only: :index do
    ul do
      li "Total Revenue: R$ #{Subscription.where(status: "paid").sum(:amount).round(2)}"
      li "Active Subscriptions: #{Subscription.where(status: "paid", expires_at: Time.zone.today..).count}"
      li "Pending Payments: #{Subscription.where(status: "pending").count}"
    end
  end
end
