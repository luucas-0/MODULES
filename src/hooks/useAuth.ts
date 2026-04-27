"use client";

import { useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import type { LoginBody, RegisterBody } from "@/src/types/auth";

export function useAuth() {
    const ctx = useAuthContext();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleLogin(data: LoginBody) {
        setError(null);
        setIsPending(true);
        try {
            await ctx.login(data);
        } catch (e: any) {
            setError(e.message ?? "Error al iniciar sesión");
        } finally {
            setIsPending(false);
        }
    }

    async function handleRegister(data: RegisterBody) {
        setError(null);
        setIsPending(true);
        try {
            await ctx.register(data);
        } catch (e : unknown) {
            setError("Error al registrarse");
        } finally {
            setIsPending(false);
        }
    }

    async function handleLogout() {
        await ctx.logout();
    }

    return {
        ...ctx,
        error,
        isPending,
        handleLogin,
        handleRegister,
        handleLogout,
    };
}