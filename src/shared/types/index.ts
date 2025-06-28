/**
 * Export centralisé des types partagés
 */
export * from './wardrobe';

// Autres types globaux peuvent être ajoutés ici
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}