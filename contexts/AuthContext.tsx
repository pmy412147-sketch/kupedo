'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userProfile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const profileWithAdmin = {
        ...data,
        admin_role: adminData?.role || null
      };

      setUserProfile(profileWithAdmin);
      return profileWithAdmin;
    }
    return data;
  };

  const createUserProfile = async (userId: string, email: string, name?: string, avatarUrl?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: name || email.split('@')[0],
        avatar_url: avatarUrl,
        verified_email: true
      })
      .select()
      .single();

    if (data) {
      setUserProfile(data);
    }
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          if (!profile) {
            createUserProfile(
              session.user.id,
              session.user.email!,
              session.user.user_metadata.full_name || session.user.user_metadata.name,
              session.user.user_metadata.avatar_url
            );
          }
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          if (!profile) {
            createUserProfile(
              session.user.id,
              session.user.email!,
              session.user.user_metadata.full_name || session.user.user_metadata.name,
              session.user.user_metadata.avatar_url
            );
          }
        });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          full_name: name,
        },
      },
    });

    if (error) throw error;

    // Profile is automatically created by database trigger
    // Wait a moment for the trigger to complete
    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
