# Configuration du Storage Supabase pour la Garde-robe

## 1. Créer le bucket dans Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "Storage"
3. Cliquez sur "New bucket"
4. Créez un bucket nommé `wardrobe` avec les paramètres suivants :
   - Public bucket: ✅ (coché)
   - File size limit: 5MB (ou selon vos besoins)
   - Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

## 2. Configurer les politiques de sécurité

Dans l'onglet "Policies" du bucket `wardrobe`, ajoutez les politiques suivantes :

### Politique de lecture (SELECT)
```sql
-- Permettre à tous de lire les images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'wardrobe');
```

### Politique d'upload (INSERT)
```sql
-- Permettre aux utilisateurs authentifiés d'uploader dans leur dossier
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'wardrobe' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Politique de suppression (DELETE)
```sql
-- Permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'wardrobe' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Structure des dossiers

Les images sont organisées selon la structure suivante :
```
wardrobe/
├── {userId}/
│   ├── top/
│   │   ├── {timestamp}_image1.jpg
│   │   └── {timestamp}_image2.jpg
│   ├── bottom/
│   ├── shoes/
│   ├── dress/
│   ├── outerwear/
│   └── accessory/
```

## 4. Configuration de l'application

Assurez-vous que votre fichier `.env` contient les bonnes valeurs :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

## 5. Utilisation dans l'application

Le service `storageService` gère automatiquement :
- L'upload des photos avec conversion en base64
- La génération d'URLs publiques
- La suppression des photos
- L'organisation par catégorie et utilisateur

### Exemple d'upload :
```javascript
const { url, path } = await storageService.uploadPhoto(
  imageUri,    // URI de l'image depuis expo-image-picker
  userId,      // ID de l'utilisateur
  'top'        // Catégorie du vêtement
);
```

### Exemple de suppression :
```javascript
await storageService.deletePhoto(imagePath);
```

## 6. Limitations et considérations

- Taille maximale par fichier : 5MB (configurable)
- Formats acceptés : JPEG, PNG, WebP
- Les images sont publiquement accessibles en lecture
- Seuls les utilisateurs authentifiés peuvent uploader/supprimer

## 7. Monitoring

Pour surveiller l'utilisation du storage :
1. Dashboard Supabase > Storage > Usage
2. Vérifiez régulièrement :
   - L'espace utilisé
   - Le nombre de requêtes
   - Les erreurs éventuelles