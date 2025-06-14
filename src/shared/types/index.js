// Types partagés entre modules
// Uniquement les types nécessaires à la communication inter-modules

export const UserTypes = {
  id: 'string',
  email: 'string',
  name: 'string',
};

export const ClothingTypes = {
  id: 'string',
  name: 'string',
  imageUrl: 'string',
  userId: 'string',
};

export const AnalysisTypes = {
  id: 'string',
  userId: 'string',
  imageUrl: 'string',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  result: 'object',
};