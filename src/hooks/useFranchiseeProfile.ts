import React from 'react';
import { franchiseeApi } from '../services/api';
import { Franchisee, FranchiseePatch, ProfilePreferences } from '../types/api';

const STORAGE_PREFIX = 'drivncook:profile-preferences';
const buildStorageKey = (franchiseeId: number): string => `${STORAGE_PREFIX}:${franchiseeId}`;

const readStoredPreferences = (franchiseeId: number): ProfilePreferences | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const rawValue = window.localStorage.getItem(buildStorageKey(franchiseeId));
    return rawValue ? (JSON.parse(rawValue) as ProfilePreferences) : null;
  } catch (error) {
    console.warn('Unable to parse stored profile preferences', error);
    return null;
  }
};

const persistPreferences = (franchiseeId: number, prefs: ProfilePreferences): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(buildStorageKey(franchiseeId), JSON.stringify(prefs));
  } catch (error) {
    console.warn('Unable to persist profile preferences', error);
  }
};

interface UseFranchiseeProfileOptions {
  initialPreferences?: ProfilePreferences;
}

interface SubmitPayload {
  profilePatch: FranchiseePatch;
  preferences: ProfilePreferences;
}

interface UseFranchiseeProfileResult {
  franchisee: Franchisee | null;
  isLoading: boolean;
  error: string | null;
  preferences: ProfilePreferences;
  loadFranchisee: () => Promise<Franchisee | null>;
  submitProfile: (payload: SubmitPayload) => Promise<void>;
  reset: () => void;
}

const DEFAULT_ACCENT_COLOR = '#2F5D50';

export const useFranchiseeProfile = (
  options?: UseFranchiseeProfileOptions,
): UseFranchiseeProfileResult => {
  const defaultPreferences = React.useMemo<ProfilePreferences>(
    () => ({
      accentColor: options?.initialPreferences?.accentColor ?? DEFAULT_ACCENT_COLOR,
      avatarDataUrl: options?.initialPreferences?.avatarDataUrl,
    }),
    [options?.initialPreferences?.accentColor, options?.initialPreferences?.avatarDataUrl],
  );

  const mergeWithDefaults = React.useCallback(
    (next?: ProfilePreferences | null): ProfilePreferences => ({
      accentColor: next?.accentColor ?? defaultPreferences.accentColor,
      avatarDataUrl: next?.avatarDataUrl ?? defaultPreferences.avatarDataUrl,
    }),
    [defaultPreferences],
  );

  const [franchisee, setFranchisee] = React.useState<Franchisee | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preferences, setPreferences] = React.useState<ProfilePreferences>(defaultPreferences);

  const loadFranchisee = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await franchiseeApi.getCurrent();
      setFranchisee(data);

      const storedPrefs = readStoredPreferences(data.id);
      setPreferences(mergeWithDefaults(storedPrefs));

      return data;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load profile';
      setError(message);
      setFranchisee(null);
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, [mergeWithDefaults]);

  const submitProfile = React.useCallback(
    async ({ profilePatch, preferences: nextPreferences }: SubmitPayload) => {
      const updated = await franchiseeApi.updateCurrent(profilePatch);
      setFranchisee(updated);

      const mergedPrefs = mergeWithDefaults(nextPreferences);
      setPreferences(mergedPrefs);
      persistPreferences(updated.id, mergedPrefs);
    },
    [mergeWithDefaults],
  );

  const reset = React.useCallback(() => {
    setFranchisee(null);
    setError(null);
    setPreferences(defaultPreferences);
  }, [defaultPreferences]);

  return {
    franchisee,
    isLoading,
    error,
    preferences,
    loadFranchisee,
    submitProfile,
    reset,
  };
};

export type { SubmitPayload as ProfileSubmitPayload, UseFranchiseeProfileResult };
