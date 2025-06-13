# Auth Module

Module d'authentification pour l'application Vêtements.

## Structure
```
auth/
├── components/       # Composants UI (LoginScreen, SignUpScreen)
├── contexts/        # Context d'authentification
├── hooks/           # Hook useAuth
├── api.js          # API calls vers le backend
├── types/          # Types TypeScript (à implémenter)
├── __tests__/      # Tests unitaires
└── index.js        # Exports du module
```

## Utilisation

```javascript
import { useAuth, LoginScreen, authAPI } from '@/features/auth';

// Dans un composant
const { user, signIn, signOut } = useAuth();

// Appel API direct
const result = await authAPI.login(email, password);
```

## Interfaces

### Context
- `user`: Utilisateur actuel
- `loading`: État de chargement
- `signIn`: Fonction de connexion
- `signUp`: Fonction d'inscription
- `signOut`: Fonction de déconnexion
- `signInWithGoogle`: Connexion Google OAuth

### API
- `authAPI.login(email, password)`
- `authAPI.register(email, password, fullName)`
- `authAPI.logout()`
- `authAPI.getCurrentUser()`