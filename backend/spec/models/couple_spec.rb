# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Couple, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:user1_id) }
    it { is_expected.to validate_presence_of(:user2_id) }
    it { is_expected.to belong_to(:user1).class_name('User') }
    it { is_expected.to belong_to(:user2).class_name('User') }
    it { is_expected.to have_many(:moods).dependent(:destroy) }
    it { is_expected.to have_many(:invites).dependent(:destroy) }
  end

  describe 'custom validations' do
    it 'does not allow same user as user1 and user2' do
      user = create(:user)
      couple = build(:couple, user1: user, user2: user)
      expect(couple).not_to be_valid
    end
    
    it 'allows different users' do
      user1 = create(:user, email: 'user1@example.com')
      user2 = create(:user, email: 'user2@example.com')
      couple = build(:couple, user1: user1, user2: user2)
      expect(couple).to be_valid
    end
  end

  describe '#users' do
    it 'returns both users in the couple' do
      users = create_user_with_couple
      couple = users[:couple]
      
      expect(couple.users).to contain_exactly(users[:user1], users[:user2])
    end
  end

  describe '#both_checked_in_today?' do
    let(:users) { create_user_with_couple }
    let(:couple) { users[:couple] }
    
    context 'when both users checked in today' do
      before do
        create(:mood, user: users[:user1], couple: couple, created_at: Time.zone.today.beginning_of_day)
        create(:mood, user: users[:user2], couple: couple, created_at: Time.zone.today.beginning_of_day)
      end
      
      it 'returns true' do
        expect(couple.both_checked_in_today?).to be true
      end
    end
    
    context 'when only one user checked in today' do
      before do
        create(:mood, user: users[:user1], couple: couple, created_at: Time.zone.today.beginning_of_day)
      end
      
      it 'returns false' do
        expect(couple.both_checked_in_today?).to be false
      end
    end
    
    context 'when no users checked in today' do
      it 'returns false' do
        expect(couple.both_checked_in_today?).to be false
      end
    end
  end

  describe '#days_since_creation' do
    let(:couple) { create(:couple, created_at: 30.days.ago) }
    
    it 'returns the number of days since the couple was created' do
      expect(couple.days_since_creation).to be >= 29
      expect(couple.days_since_creation).to be <= 31
    end
  end
end
