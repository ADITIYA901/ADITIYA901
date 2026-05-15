import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import type { Admin, Voter, UserRole, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: 'admin' | 'voter') => Promise<void>;
  signup: (data: SignupData, role: 'admin' | 'voter') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  aadhaar_id?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (adminData) {
      return { user: adminData as Admin, role: 'admin' as UserRole };
    }

    const { data: voterData } = await supabase
      .from('voters')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (voterData) {
      return { user: voterData as Voter, role: 'voter' as UserRole };
    }

    return { user: null, role: null };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { user, role } = await fetchUserProfile(session.user.id, session.user.email || '');
      setState({ user, role, isAuthenticated: !!user, isLoading: false });
    } else {
      setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { user, role } = await fetchUserProfile(session.user.id, session.user.email || '');
          setState({ user, role, isAuthenticated: !!user, isLoading: false });
        } else {
          setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, refreshUser]);

  const login = useCallback(async (email: string, password: string, role: 'admin' | 'voter') => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Login failed');

    const tableName = role === 'admin' ? 'admins' : 'voters';
    const { data, error: profileError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError || !data) throw new Error(`${role} profile not found`);

    setState({ user: data, role, isAuthenticated: true, isLoading: false });
  }, []);

  const signup = useCallback(async (data: SignupData, role: 'admin' | 'voter') => {
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (authError) throw authError;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Signup failed');

    const tableName = role === 'admin' ? 'admins' : 'voters';
    const profileData: Record<string, unknown> = {
      id: session.user.id,
      email: data.email,
      name: data.name,
    };

    if (role === 'voter' && data.aadhaar_id) {
      profileData.aadhaar_id = data.aadhaar_id;
    }

    const { error: profileError } = await supabase
      .from(tableName)
      .insert(profileData);

    if (profileError) throw profileError;

    const { data: profile } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    setState({ user: profile, role, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
