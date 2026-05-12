import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    full_name?: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId?: string) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from<Database['public']['Tables']['user_profiles']['Row']>('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Failed to fetch user profile:', error.message);
      setProfile(null);
      return null;
    }

    setProfile(data ?? null);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.warn('Failed to get session:', error.message);
        }

        if (!mounted) return;

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          fetchUserProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? null,
        },
      },
    });

    if (error) {
      throw error;
    }

    const createdUser = data?.user ?? data?.session?.user ?? null;

    if (createdUser) {
      await supabase.from('user_profiles').upsert(
        {
          id: createdUser.id,
          full_name: fullName ?? null,
        },
        { onConflict: 'id' }
      );
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (payload: {
    full_name?: string;
    phone?: string;
    address?: string;
  }) => {
    if (!user) {
      throw new Error('User must be logged in to update profile');
    }

    const updatePayload = {
      id: user.id,
      full_name: payload.full_name?.trim() ?? null,
      phone: payload.phone?.trim() ?? null,
      address: payload.address?.trim() ?? null,
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(updatePayload, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    await fetchUserProfile(user.id);
  }, [fetchUserProfile, user]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    await fetchUserProfile(user.id);
  }, [fetchUserProfile, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
