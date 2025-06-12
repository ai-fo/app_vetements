# Configuration de l'authentification Google avec Supabase

## 1. Configuration dans Supabase Dashboard

1. Connectez-vous à votre [dashboard Supabase](https://app.supabase.com)
2. Allez dans **Authentication** > **Providers**
3. Activez **Google** et configurez :

### Obtenir les clés Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ dans la bibliothèque d'API
4. Allez dans **APIs & Services** > **Credentials**
5. Cliquez sur **Create Credentials** > **OAuth client ID**
6. Choisissez **Application type** : 
   - Pour iOS : iOS
   - Pour Android : Android
   - Pour Web : Web application

### Pour iOS
- Bundle ID : `com.anonymous.liquid-app`
- URL Scheme : `liquidapp` et `com.googleusercontent.apps.612466735730-3a257kmveufsc6f476ais9djm5t36irg`
- Client ID : `612466735730-3a257kmveufsc6f476ais9djm5t36irg.apps.googleusercontent.com`

### Pour Android
- Package name : `com.anonymous.liquidapp`
- SHA-1 certificate fingerprint : (voir ci-dessous pour générer)

### Pour générer le SHA-1 pour Android :
```bash
cd android
./gradlew signingReport
```

### Dans Supabase :
- **Client ID** : Copiez depuis Google Cloud Console
- **Client Secret** : Copiez depuis Google Cloud Console
- **Authorized redirect URIs** : 
  - Ajoutez : `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
  - Pour mobile : `liquidapp://auth/callback`

## 2. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```
EXPO_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Configuration iOS supplémentaire

Dans `ios/liquidapp/Info.plist`, ajoutez :

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>liquidapp</string>
        </array>
    </dict>
</array>
```

## 4. Configuration Android supplémentaire

Dans `android/app/src/main/AndroidManifest.xml`, ajoutez dans la section `<activity>` :

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="liquidapp" android:host="auth" />
</intent-filter>
```

## 5. Test de l'authentification

1. Lancez l'application :
   ```bash
   npm start
   ```

2. Testez la connexion Google en cliquant sur "Continuer avec Google"

## Dépannage

- **Erreur "Invalid redirect URL"** : Vérifiez que l'URL de redirection dans Google Cloud Console correspond à celle de Supabase
- **Erreur sur Android** : Assurez-vous que le SHA-1 est correctement configuré
- **Erreur sur iOS** : Vérifiez que le Bundle ID et l'URL Scheme sont corrects

## Notes importantes

- L'authentification Google ne fonctionne pas sur Expo Go, vous devez utiliser un build de développement
- Pour tester sur un appareil physique, utilisez :
  ```bash
  expo run:ios
  # ou
  expo run:android
  ```