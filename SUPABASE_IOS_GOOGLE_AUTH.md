# Configuration Google Auth pour iOS avec Supabase

## Solution : Créer un Client OAuth Web pour obtenir le Client Secret

Pour iOS, Google ne fournit pas de client secret directement. Voici comment configurer Supabase :

### 1. Créer un Client OAuth Web dans Google Cloud Console

1. Allez dans [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Cliquez sur **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
4. Choisissez **"Web application"** (pas iOS!)
5. Nommez-le : "Supabase OAuth"
6. Dans **"Authorized redirect URIs"**, ajoutez :
   - `https://[VOTRE-PROJECT-REF].supabase.co/auth/v1/callback`

### 2. Configurer Supabase

Dans Supabase Dashboard > Authentication > Providers > Google :
- **Enable Google provider** : ON
- **Client ID** : Utilisez le Client ID du client **Web** que vous venez de créer
- **Client Secret** : Utilisez le Client Secret du client **Web**

### 3. Garder votre configuration iOS

Votre app iOS continuera d'utiliser :
- Le Client ID iOS : `612466735730-3a257kmveufsc6f476ais9djm5t36irg.apps.googleusercontent.com`
- L'URL Scheme iOS : `com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg`

### Résumé

- **Supabase** utilise les credentials du client OAuth **Web**
- **Votre app iOS** utilise le client OAuth **iOS**
- Les deux sont liés au même projet Google Cloud

Cette configuration permet à Supabase de valider les tokens Google tout en gardant l'authentification native iOS.