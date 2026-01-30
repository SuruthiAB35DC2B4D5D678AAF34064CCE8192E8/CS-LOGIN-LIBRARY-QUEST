import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  roll_number: string | null;
  student_name: string | null;
  department: string | null;
  class: string | null;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'user_id'>>) => Promise<boolean>;
  createProfile: (profileData: Omit<UserProfile, 'id' | 'user_id'>) => Promise<boolean>;
}

export const useUserProfile = (userId: string | undefined): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'user_id'>>): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return true;
    } catch (err) {
      console.error('Error in updateProfile:', err);
      return false;
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'user_id'>): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      setProfile(data);
      return true;
    } catch (err) {
      console.error('Error in createProfile:', err);
      return false;
    }
  };

  return { profile, isLoading, updateProfile, createProfile };
};
