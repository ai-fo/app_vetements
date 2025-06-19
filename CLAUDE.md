# Guide de développement pour Claude Code

## Vue d'ensemble du projet
Application React Native (vêtements) avec backend Python pour l'IA.

### ⚠️ IMPORTANT: Mode de développement
**Le backend Python gérant l'IA est temporairement exclu du Git**. 
- **NE JAMAIS SIMULER DE DONNÉES** - Si l'API ne fonctionne pas, afficher une erreur
- Les appels API vers le backend doivent retourner une vraie réponse ou une erreur
- Ne pas utiliser de données factices ou mockées
- Si le backend n'est pas disponible, informer l'utilisateur
- Le backend sera réintégré ultérieurement

## Architecture modulaire

### Principe de contexte minimal
Chaque fonctionnalité est **autonome** et **isolée**. Pour ajouter une fonctionnalité, vous n'avez besoin que de:
1. Le nom du module concerné
2. Les interfaces d'entrée/sortie
3. Les conventions du module

### Structure Frontend - React Native
```
src/
  features/           # Fonctionnalités autonomes
    auth/            # Module complet: composants, logique, types
    catalog/         # Module complet: composants, logique, types
    cart/            # Module complet: composants, logique, types
    ai-assistant/    # Module complet: composants, logique, types
  shared/            # Code partagé minimal
    api/             # Client API centralisé
    types/           # Types globaux uniquement
    ui/              # Composants UI de base
```

### Structure Backend - Python
```
backend/
  modules/           # Modules autonomes
    auth/           # Routes, services, modèles
    catalog/        # Routes, services, modèles
    cart/           # Routes, services, modèles
    ai/             # Routes, services, modèles
  core/             # Noyau minimal
    database.py     # Connexion DB
    config.py       # Configuration
```

## Conventions par module

### Module Frontend type
```typescript
// features/[module]/index.ts - Point d'entrée unique
export * from './components'
export * from './hooks'
export * from './types'
export * from './api'

// features/[module]/types.ts - Types du module
export interface ModuleState { /* ... */ }

// features/[module]/api.ts - API du module
export const moduleAPI = {
  get: async (id: string) => { /* ... */ },
  create: async (data: any) => { /* ... */ }
}
```

### Module Backend type
```python
# modules/[module]/__init__.py - Point d'entrée
from .router import router
from .service import Service

# modules/[module]/router.py - Routes du module
@router.get("/{id}")
async def get_item(id: str): pass

# modules/[module]/service.py - Logique métier
class Service:
    def process(self, data): pass
```

## Interfaces de communication

### API Frontend → Backend
```typescript
// shared/api/client.ts
interface APIResponse<T> {
  data?: T
  error?: string
}

// Chaque module expose son API
import { authAPI } from '@/features/auth'
import { catalogAPI } from '@/features/catalog'
```

### Contrats d'interface minimaux
```typescript
// Types partagés uniquement si nécessaires
interface User { id: string; email: string }
interface Product { id: string; name: string; price: number }
interface CartItem { productId: string; quantity: number }
```

## Guide d'ajout de fonctionnalité

### Nouvelle fonctionnalité Frontend
1. Créer dossier `src/features/[nouvelle-feature]/`
2. Implémenter avec structure standard:
   - `index.ts` - Exports
   - `components/` - UI
   - `hooks/` - Logique
   - `api.ts` - Appels API (avec mocks pour l'IA)
   - `types.ts` - Types locaux
3. Pour les fonctionnalités IA:
   - Ne pas simuler les réponses - retourner une erreur si l'API n'est pas disponible
   - Ajouter `// TODO: Activer l'API réelle` si nécessaire
   - Afficher un message d'erreur clair à l'utilisateur

### Nouvelle fonctionnalité Backend
1. Créer dossier `backend/modules/[nouveau-module]/`
2. Implémenter avec structure standard:
   - `__init__.py` - Exports
   - `router.py` - Endpoints
   - `service.py` - Logique
   - `models.py` - Modèles

### Exemple: Ajouter "Favoris"
```bash
# Frontend
src/features/favorites/
  ├── index.ts
  ├── components/FavoritesList.tsx
  ├── hooks/useFavorites.ts      # Contient les mocks temporaires
  ├── api.ts                     # API commentée, retourne des mocks
  └── types.ts

# Backend (exclu temporairement du Git)
backend/modules/favorites/
  ├── __init__.py
  ├── router.py
  ├── service.py
  └── models.py
```

### Exemple de gestion d'erreur pour l'IA
```javascript
// hooks/useOutfitAnalysis.js
const analyzeOutfit = async (imageUri, userId) => {
  try {
    const result = await outfitAnalysisAPI.analyzeImage(imageUri);
    return result;
  } catch (error) {
    // Ne pas simuler - afficher l'erreur
    throw new Error('Le service d\'analyse n\'est pas disponible. Veuillez réessayer plus tard.');
  }
};
```

## Commandes essentielles

```bash
# Frontend
npm install && npx expo start
npm run lint && npm test

# Backend
pip install -r requirements.txt
uvicorn backend.main:app --reload
pytest && pylint backend/
```

## Configuration minimale (.env)
```
# Frontend
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Backend
DATABASE_URL=
SUPABASE_SERVICE_KEY=
AI_API_KEY=
```

## Principes clés
1. **Isolation**: Chaque module est indépendant
2. **Contrats clairs**: Interfaces définies et stables
3. **Découplage**: Communication via API uniquement
4. **Documentation locale**: Chaque module a son README
5. **Tests unitaires**: Par module, pas d'intégration complexe

## Workflow Git - Collaboration multi-agents

### Stratégie de branches
```
main                    # Production stable
├── develop            # Intégration
    ├── feature/auth-login         # Fonctionnalité 1
    ├── feature/auth-register      # Fonctionnalité 2
    ├── feature/product-list       # Fonctionnalité 3
    ├── feature/ai-recommendations # Fonctionnalité 4
    └── feature/shopping-cart      # Fonctionnalité 5
```

### ⚠️ IMPORTANT: Une branche par fonctionnalité
**TOUJOURS créer une nouvelle branche pour CHAQUE fonctionnalité demandée**

### Workflow pour chaque fonctionnalité
```bash
# 1. OBLIGATOIRE: Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/[nom-fonctionnalité]

# 2. Développer la fonctionnalité
# src/features/[module]/...

# 3. Commit atomiques
git add .
git commit -m "feat([module]): description claire"

# 4. Push et créer PR
git push origin feature/[nom-fonctionnalité]
gh pr create --title "feat: [nom fonctionnalité]" --body "[description]"
```

### Règles de collaboration
1. **Une fonctionnalité = Une branche = Une PR**
2. **Nom de branche descriptif** : `feature/user-profile`, pas `feature/update1`
3. **Branches courtes** : 1-3 jours max, sinon découper
4. **Jamais travailler sur develop ou main directement**
5. **PR avec tests passants obligatoires**

## Bonnes pratiques obligatoires

### Tests par module
```typescript
// src/features/[module]/__tests__/
├── components.test.tsx    # Tests UI
├── hooks.test.ts         # Tests logique
├── api.test.ts          # Tests API
└── integration.test.ts   # Tests du module complet
```

```python
# backend/modules/[module]/tests/
├── test_router.py       # Tests endpoints
├── test_service.py      # Tests logique
└── test_integration.py  # Tests module complet
```

### ⚠️ OBLIGATION: Tests unitaires pour TOUTE intégration
**CHAQUE nouvelle fonctionnalité ou modification DOIT inclure des tests unitaires**

#### Avant de créer une PR:
1. **Écrire les tests AVANT ou PENDANT le développement** (TDD recommandé)
2. **Vérifier que TOUS les tests passent** : `npm test` ou `pytest`
3. **Coverage minimum de 80%** pour le nouveau code
4. **Tester les cas limites** : erreurs, données vides, permissions

#### Types de tests requis:
- **Tests unitaires** : Chaque fonction/méthode isolée
- **Tests d'intégration** : Interactions entre composants
- **Tests de régression** : S'assurer que les anciennes fonctionnalités marchent encore
- **Tests E2E** (si applicable) : Flux utilisateur complet

#### Exemple de test obligatoire:
```javascript
// Mauvais : Code sans test ❌
const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

// Bon : Code avec tests ✅
// deleteItem.test.js
describe('deleteItem', () => {
  it('should delete item successfully', async () => {
    const result = await deleteItem('123');
    expect(result.success).toBe(true);
  });
  
  it('should handle deletion errors', async () => {
    await expect(deleteItem(null)).rejects.toThrow();
  });
  
  it('should update local state after deletion', async () => {
    // Test que l'état local est mis à jour
  });
});
```

### Checklist avant PR
- [ ] Tests unitaires écrits et passants (coverage > 80%)
- [ ] Tests d'intégration pour les nouvelles features
- [ ] Tous les tests existants passent encore
- [ ] Linting sans erreurs
- [ ] Types TypeScript corrects
- [ ] Documentation du module à jour
- [ ] Pas de modifications hors du module
- [ ] Interface respectée
- [ ] Pas de secrets dans le code

### Structure de test standard
```typescript
// Frontend - Exemple test hook
describe('useModuleName', () => {
  it('should handle initial state', () => {})
  it('should handle success case', () => {})
  it('should handle error case', () => {})
})
```

```python
# Backend - Exemple test service
def test_service_process_valid_data():
    """Test avec données valides"""
    assert service.process(valid_data) == expected

def test_service_process_invalid_data():
    """Test avec données invalides"""
    with pytest.raises(ValidationError):
        service.process(invalid_data)
```

## Gestion des conflits

### Prévention
- Modules isolés = Pas de conflits
- Interfaces stables = Pas de breaking changes
- Communication asynchrone via PR

### Si conflit sur shared/
1. Discuter dans la PR
2. Créer une PR séparée pour shared/
3. Merger shared/ en premier
4. Rebaser les branches features

## Template de PR
```markdown
## Module: [nom-module]

### Description
[Que fait ce module]

### Checklist
- [ ] Tests passants
- [ ] Documentation à jour
- [ ] Pas d'impact sur autres modules
- [ ] Interface respectée

### API exposée
```typescript
// Endpoints ou méthodes publiques
```

### Dépendances
- Aucune dépendance inter-modules
- Utilise uniquement shared/api
```