export interface RegisterBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
    status: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginBody) => Promise<void>;
    register: (data: RegisterBody) => Promise<void>;
    logout: () => Promise<void>;
}