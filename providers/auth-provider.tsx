import { Session } from '@supabase/supabase-js';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  userEmail: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createConfigError() {
  return new Error(
    'Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para activar la autenticacion.',
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Error cargando sesión:', error.message);
          if (error.message.includes('refresh_token') || error.message.includes('Invalid refresh token')) {
            await supabase.auth.signOut();
          }
        }

        if (isMounted) {
          setSession(data.session ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error en loadSession:', err);
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    }

    loadSession();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      userEmail: session?.user.email ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          throw createConfigError();
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      signUp: async (email, password) => {
        if (!isSupabaseConfigured) {
          throw createConfigError();
        }

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          throw error;
        }

        return data.session ?? null;
      },
      signOut: async () => {
        if (!isSupabaseConfigured) {
          throw createConfigError();
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
