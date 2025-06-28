export interface User {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiration: Date;
}

export interface RegisterResponse {
  userId: string;
} 