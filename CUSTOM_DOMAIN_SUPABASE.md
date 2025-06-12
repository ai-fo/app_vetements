# Comment avoir une URL personnalisée avec Supabase

## Option 1 : Custom Domain (Plan Pro requis)

Si vous avez un plan Supabase Pro ou supérieur, vous pouvez configurer un domaine personnalisé :
- `auth.votredomaine.com` au lieu de `irdtiqaqwydnplvkzwfp.supabase.co`

## Option 2 : Utiliser un Proxy/Middleware

Créer une API intermédiaire sur votre propre domaine qui redirige vers Supabase.

## Option 3 : Personnaliser l'écran de connexion

Au lieu d'ouvrir la page Supabase, vous pouvez :

1. **Utiliser un WebView personnalisé** avec votre propre UI
2. **Implémenter Google Sign-In natif** puis envoyer le token à Supabase

### Implémentation Google Sign-In Natif (Recommandé)

```bash
npm install @react-native-google-signin/google-signin
```

Cette approche :
- N'affiche jamais l'URL Supabase aux utilisateurs
- Utilise l'interface native de Google
- Plus professionnel et rassurant
- Meilleure expérience utilisateur

## Option 4 : Changer le nom du projet Supabase

Malheureusement, on ne peut pas changer l'URL d'un projet Supabase existant. Il faudrait :
1. Créer un nouveau projet Supabase
2. Migrer vos données
3. Espérer avoir une URL plus sympa (c'est aléatoire)

## Recommandation

Pour une app mobile, je recommande l'**Option 3 avec Google Sign-In natif**. Les utilisateurs ne verront que l'interface Google officielle, pas l'URL Supabase.