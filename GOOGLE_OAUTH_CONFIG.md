# Configuration Google OAuth - Valeurs Actuelles

## Informations Google OAuth

- **Client ID**: `612466735730-3a257kmveufsc6f476ais9djm5t36irg.apps.googleusercontent.com`
- **iOS URL Scheme**: `com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg`

## Configuration dans Supabase

1. Dans votre dashboard Supabase, allez dans **Authentication** > **Providers** > **Google**
2. Activez le provider Google
3. Entrez le **Client ID** ci-dessus
4. Entrez le **Client Secret** (à récupérer depuis Google Cloud Console)

## URLs de redirection

Ajoutez ces URLs dans Google Cloud Console > APIs & Services > Credentials > Votre OAuth 2.0 Client ID :

- `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- `liquidapp://auth/callback`
- `com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg://auth/callback`

## Test

Pour tester l'authentification Google :

1. Assurez-vous que votre `.env` contient les bonnes valeurs Supabase
2. Lancez l'application sur un simulateur iOS ou Android
3. Cliquez sur "Continuer avec Google" ou "S'inscrire avec Google"
4. Suivez le flux d'authentification Google

**Note**: L'authentification Google ne fonctionne pas avec Expo Go. Utilisez :
```bash
expo run:ios
# ou
expo run:android
```