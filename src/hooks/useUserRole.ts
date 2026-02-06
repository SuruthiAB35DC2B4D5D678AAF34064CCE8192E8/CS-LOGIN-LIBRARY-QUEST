import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'staff' | 'student';

interface UserRoleState {
  session: Session | null;
  isLoading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean;
  userEmail: string | null;
  userId: string | null;
}

export const useUserRole = () => {
  const [state, setState] = useState<UserRoleState>({
    session: null,
    isLoading: true,
    roles: [],
    isAdmin: false,
    isStaff: false,
    userEmail: null,
    userId: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchRoles = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user roles:', error);
          return [];
        }

        return (data || []).map((r) => r.role as AppRole);
      } catch (err) {
        console.error('Error in fetchRoles:', err);
        return [];
      }
    };

    const updateState = async (session: Session | null) => {
      if (!session) {
        if (mounted) {
          setState({
            session: null,
            isLoading: false,
            roles: [],
            isAdmin: false,
            isStaff: false,
            userEmail: null,
            userId: null,
          });
        }
        return;
      }

      const roles = await fetchRoles(session.user.id);
      
      if (mounted) {
        setState({
          session,
          isLoading: false,
          roles,
          isAdmin: roles.includes('admin'),
          isStaff: roles.includes('staff') || roles.includes('admin'),
          userEmail: session.user.email || null,
          userId: session.user.id,
        });
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateState(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateState(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
};
