import { fetcher } from "@/src/lib/fetcher";
import type { LoginBody, RegisterBody, AuthUser, ApiResponse } from "@/src/types/auth";

const BASE = "/api/auth";

export const authService = {
    async register(data: RegisterBody): Promise<AuthUser> {
        return fetcher<AuthUser>(`${BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async login(data: LoginBody): Promise<AuthUser> {
        return fetcher<AuthUser>(`${BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async logout(): Promise<void> {
        await fetch(`${BASE}/logout`, { method: "POST" });
    },

    async me(): Promise<AuthUser> {
        return fetcher<AuthUser>("/api/users/me");
    },
};