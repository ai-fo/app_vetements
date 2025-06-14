// Types spécifiques au module auth

export const AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const LoginCredentials = {
  email: 'string',
  password: 'string',
};

export const RegisterData = {
  email: 'string',
  password: 'string',
  name: 'string',
};

export const AuthUser = {
  id: 'string',
  email: 'string',
  name: 'string',
};

export const AuthTokens = {
  token: 'string',
  refreshToken: 'string',
};