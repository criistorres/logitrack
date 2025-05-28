
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'motorista' | 'logistica' | 'admin';
    cpf: string;
    phone?: string;
    is_active: boolean;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
  }