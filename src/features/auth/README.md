# Module Auth

## Description
Module d'authentification gérant la connexion, l'inscription et la gestion des sessions utilisateur.

## Interface publique

### Composants
- `LoginScreen` - Écran de connexion
- `SignUpScreen` - Écran d'inscription

### Hooks
- `useAuth()` - Hook principal pour accéder au contexte d'authentification

### Context
- `AuthProvider` - Provider à placer à la racine de l'app

### API
- `authAPI.login(email, password)` - Connexion utilisateur
- `authAPI.register(email, password, name)` - Inscription
- `authAPI.getProfile()` - Récupérer le profil
- `authAPI.logout()` - Déconnexion
- `authAPI.refreshToken(refreshToken)` - Rafraîchir le token

## Utilisation

```javascript
import { useAuth, LoginScreen } from '@/features/auth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (!user) {
    return <LoginScreen />;
  }
  
  // ...
}
```

## État actuel
- ✅ Authentification email/password (mockée)
- ❌ OAuth Google (en attente backend)
- ✅ Gestion des tokens
- ✅ Persistance de session