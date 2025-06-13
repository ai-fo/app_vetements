// Shared types for the application
// When migrating to TypeScript, these will become proper interfaces

// User type
export const UserType = {
  id: '',
  email: '',
  fullName: '',
  createdAt: '',
};

// Product type
export const ProductType = {
  id: '',
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  category: '',
  sizes: [],
  colors: [],
};

// Cart item type
export const CartItemType = {
  productId: '',
  quantity: 0,
  size: '',
  color: '',
};

// Order type
export const OrderType = {
  id: '',
  userId: '',
  items: [],
  total: 0,
  status: '',
  createdAt: '',
};