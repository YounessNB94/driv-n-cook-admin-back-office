import React from 'react';
import { Franchisee, FranchiseePatch, ProfilePreferences } from '../../types/api';

interface ProfilePageProps {
  onBack?: () => void;
  franchisee: Franchisee | null;
  preferences: ProfilePreferences;
  isLoading: boolean;
  error?: string | null;
  onSubmit: (data: { profilePatch: FranchiseePatch; preferences: ProfilePreferences }) => Promise<void>;
}

const ProfilePage = (_props: ProfilePageProps): React.ReactElement => {
  return <></>;
};

export default ProfilePage;
