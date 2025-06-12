import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await AsyncStorage.setItem('user', JSON.stringify(session.user));
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Utiliser une URL de redirection fixe pour éviter les problèmes localhost
      const redirectUrl = Platform.select({
        ios: 'com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg://',
        android: 'liquidapp://auth/callback',
        default: 'liquidapp://auth/callback'
      });
      
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No authentication URL received');
      }

      const res = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (res.type === 'success' && res.url) {
        const { url } = res;
        
        // Essayer d'extraire depuis le fragment (#)
        const fragment = url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (sessionError) throw sessionError;
            return { data: sessionData.user, error: null };
          }
        }
        
        // Essayer d'extraire le code depuis les query params (?)
        const queryString = url.split('?')[1];
        if (queryString) {
          const params = new URLSearchParams(queryString);
          const code = params.get('code');
          
          if (code) {
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
            if (sessionError) throw sessionError;
            return { data: sessionData.user, error: null };
          }
        }
        
        // Si aucun token ou code trouvé
        throw new Error('No authentication tokens or code found in callback URL');
      } else if (res.type === 'cancel') {
        return { data: null, error: new Error('Connexion annulée par l\'utilisateur') };
      } else {
        throw new Error('Erreur inconnue lors de l\'authentification');
      }
    } catch (error) {
      console.error('Error during Google sign in:', error);
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};