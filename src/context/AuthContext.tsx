"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import type { AuthUser, AuthContextType, LoginBody, RegisterBody } from "@/src/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Al montar, verificar si hay sesión activa
    useEffect(() => {
        authService
            .me()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (data: LoginBody) => {
        const user = await authService.login(data);
        setUser(user);
        router.push("/dashboard");
    }, [router]);

    const register = useCallback(async (data: RegisterBody) => {
        const user = await authService.register(data);
        setUser(user);
        router.push("/dashboard");
    }, [router]);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext debe usarse dentro de <AuthProvider>");
    return ctx;
}