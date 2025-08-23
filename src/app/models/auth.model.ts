export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  token: string | null;
  username: string | null;
  nombre: string | null;
  apellido: string | null;
  rol: string | null;
  message: string;
  success: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso: string;
}

export interface UserSession {
  token: string;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
  isAuthenticated: boolean;
}
