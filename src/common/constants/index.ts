export enum ROLES {
  ADMIN = 'admin',
  USER = 'user',
}

export enum HAND {
  LEFT = 'left',
  RIGHT = 'right',
}
export interface TokenPayload {
  id?: string;
  userId?: string;
  email?: string;
  role: string;
  exp?: number;
  iat?: number;
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}