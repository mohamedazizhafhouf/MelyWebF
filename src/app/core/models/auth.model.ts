export enum UserRole {
    AGENT = 'agent',
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager'

}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}