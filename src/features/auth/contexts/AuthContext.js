import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';
import { apiClient } from '../../../shared/api/client';
import { supabase } from '../../../shared/api/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Écouter les changements d'auth Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await AsyncStorage.setItem('user', JSON.stringify(session.user));
      } else if (!session && event === 'SIGNED_OUT') {
        setUser(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      // D'abord vérifier Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await AsyncStorage.setItem('user', JSON.stringify(session.user));
        setLoading(false);
        return;
      }

      // Sinon vérifier notre système d'auth custom
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        apiClient.setAuthToken(storedToken);
        
        // Vérifier si le token est toujours valide
        const { data, error } = await authAPI.getProfile();
        if (error) {
          // Token invalide, déconnecter l'utilisateur
          await signOut();
        } else {
          setUser(data);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name = '') => {
    try {
      const { data, error } = await authAPI.register(email, password, name);
      if (error) throw new Error(error);
      
      if (data) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await apiClient.setAuthToken(data.token);
      }
      
      return { data: data?.user, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authAPI.login(email, password);
      if (error) throw new Error(error);
      
      if (data) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await apiClient.setAuthToken(data.token);
      }
      
      return { data: data?.user, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // Déconnexion Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) throw supabaseError;
      
      // Déconnexion API custom
      await authAPI.logout();
      
      // Nettoyer l'état local
      setUser(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      await apiClient.setAuthToken(null);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Vérifier d'abord si Supabase est correctement configuré
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        throw new Error('Supabase non configuré');
      }

      // Utiliser une URL de redirection fixe pour éviter les problèmes localhost
      const redirectUrl = Platform.select({
        ios: 'com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg://',
        android: 'liquidapp://auth/callback',
        default: 'liquidapp://auth/callback'
      });
      
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

      if (error) {
        throw error;
      }

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
          
          // Vérifier s'il y a une erreur dans les params
          const errorParam = params.get('error');
          if (errorParam) {
            const errorDescription = params.get('error_description');
            throw new Error(errorDescription || errorParam);
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
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};