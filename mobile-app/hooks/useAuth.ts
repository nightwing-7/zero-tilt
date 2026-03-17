import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Profile, getProfile } from '../services/profile';
import { setUser, clearUser } from '../services/sentry';
import { identifyUser, resetUser } from '../services/analytics';

export interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let subscription: any;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          const profile = await getProfile(data.session.user.id);
          setState({
            user: data.session.user,
            session: data.session,
            profile,
            loading: false,
            error: null,
          });

          setUser(data.session.user.id, data.session.user.email);
          identifyUser(data.session.user.id, {
            email: data.session.user.email,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    init();

    subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          loading: false,
          error: null,
        });

        setUser(session.user.id, session.user.email);
        identifyUser(session.user.id, {
          email: session.user.email,
        });
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          error: null,
        });

        clearUser();
        resetUser();
      }
    });

    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  async function signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<boolean> {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          email,
          full_name: fullName,
          has_completed_onboarding: false,
        });

        if (profileError) {
          throw profileError;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
        }));

        return true;
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return false;
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        const profile = await getProfile(data.session.user.id);
        setState({
          user: data.session.user,
          session: data.session,
          profile,
          loading: false,
          error: null,
        });

        return true;
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return false;
    }
  }

  async function signOut(): Promise<boolean> {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      });

      clearUser();
      resetUser();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return false;
    }
  }

  async function onAuthStateChange(
    callback: (event: string, session: any) => void
  ): Promise<void> {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    onAuthStateChange,
  };
}
