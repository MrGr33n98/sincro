# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:encrypted_password) }
    
    it 'validates email format' do
      user = build(:user, email: 'invalid-email')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include('is invalid')
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:couple).optional }
    it { is_expected.to have_many(:moods).dependent(:destroy) }
    it { is_expected.to have_many(:conversations).dependent(:destroy) }
    it { is_expected.to have_one(:subscription).dependent(:destroy) }
    it { is_expected.to have_many(:invites).dependent(:destroy) }
  end

  describe '#pro?' do
    let(:user) { create(:user) }
    
    context 'when user has Pro subscription' do
      before do
        user.update!(is_pro: true, pro_expires_at: 1.year.from_now)
      end
      
      it 'returns true' do
        expect(user.pro?).to be true
      end
      
      context 'when subscription is expired' do
        before do
          user.update!(pro_expires_at: 1.day.ago)
        end
        
        it 'returns false' do
          expect(user.pro?).to be false
        end
      end
    end
    
    context 'when user does not have Pro subscription' do
      it 'returns false' do
        expect(user.pro?).to be false
      end
    end
  end

  describe '#active_mood_today?' do
    let(:user) { create(:user) }
    
    context 'when user has mood today' do
      before do
        create(:mood, user: user, created_at: Time.zone.today.beginning_of_day)
      end
      
      it 'returns true' do
        expect(user.active_mood_today?).to be true
      end
    end
    
    context 'when user has no mood today' do
      it 'returns false' do
        expect(user.active_mood_today?).to be false
      end
    end
  end

  describe '#current_streak' do
    let(:user) { create(:user) }
    let(:couple) { create(:couple, user1: user) }
    
    it 'calculates consecutive days with moods' do
      # Create moods for last 3 days
      3.times do |i|
        create(:mood, user: user, couple: couple, created_at: i.days.ago.beginning_of_day)
      end
      
      expect(user.current_streak).to eq(3)
    end
    
    it 'returns 0 when no moods' do
      expect(user.current_streak).to eq(0)
    end
  end
end
