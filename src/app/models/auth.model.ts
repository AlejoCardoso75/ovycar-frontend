export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
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
