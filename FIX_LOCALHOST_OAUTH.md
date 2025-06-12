# Résolution du problème localhost avec OAuth

## Le problème

L'erreur "Safari ne peut pas ouvrir la page" avec "localhost" apparaît car :
1. Vous utilisez Expo Go ou un simulateur
2. L'authentification OAuth essaie de rediriger vers localhost
3. Le simulateur iOS n'a pas de serveur localhost

## Solutions

### Solution 1 : Utiliser un Build de Développement (Recommandé)

```bash
# Installer EAS CLI si pas déjà fait
npm install -g eas-cli

# Se connecter à Expo
eas login

# Initialiser EAS dans votre projet
eas build:configure

# Créer un build de développement pour iOS
eas build --profile development --platform ios

# Ou pour le simulateur local
expo run:ios
```

### Solution 2 : Configurer les URLs dans Google Cloud Console

Ajoutez ces URLs de redirection dans votre client OAuth :
1. `https://auth.expo.io/@your-username/liquid-app/auth/callback`
2. `exp://localhost:19000/--/auth/callback` (pour Expo Go)
3. `liquidapp://auth/callback`

### Solution 3 : Tester sur un appareil physique

1. Installer Expo Go sur votre iPhone
2. Scanner le QR code
3. L'authentification devrait mieux fonctionner

### Solution 4 : Utiliser ngrok pour le développement

```bash
# Installer ngrok
npm install -g ngrok

# Exposer votre app
ngrok http 19000
```

Puis utiliser l'URL ngrok dans vos redirections.

## Configuration temporaire pour le développement

Dans `AuthContext.js`, vous pouvez ajouter une condition pour le dev :

```javascript
const redirectUrl = __DEV__ 
  ? 'exp://localhost:19000/--/auth/callback'
  : AuthSession.makeRedirectUri({
      scheme: 'liquidapp',
      path: 'auth/callback'
    });
```

## Recommandation

Pour le développement avec OAuth, utilisez `expo run:ios` plutôt qu'Expo Go. Cela créera une vraie app avec les bonnes configurations URL scheme.