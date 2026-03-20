import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, attempting to create one...');
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        if (authUser) {
          const isMainAdmin = authUser.email === 'delamare@gmail.com';
          const newProfileData = {
            id: userId,
            email: authUser.email,
            display_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            role: isMainAdmin ? 'admin' : 'inativo',
          };
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfileData])
            .select()
            .single();

          if (createError) throw createError;
          setUser(newProfile);
        }
      } else if (error) {
        throw error;
      } else {
        // Se o perfil existe mas o cargo está errado para o admin principal
        if (data.email === 'delamare@gmail.com' && data.role !== 'admin') {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();
          
          setUser(updatedProfile || data);
        } else {
          setUser(data);
        }
      }
    } catch (error) {
      console.error('fetchUserProfile unexpected error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      // Fetch profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profileError && profile && profile.role === 'inativo') {
        await supabase.auth.signOut();
        throw new Error('Sua conta está inativa. Aguarde a aprovação de um administrador.');
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        if (error.status === 429) {
          throw new Error('Limite de envios de e-mail excedido. Por favor, aguarde alguns minutos ou desative a confirmação de e-mail no painel do Supabase.');
        }
        throw error;
      }
      
      alert('Cadastro realizado com sucesso! Sua conta está inativa e aguarda aprovação de um administrador.');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
