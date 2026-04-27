"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";

export default function LoginPage() {
    const { handleLogin, isPending, error } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await handleLogin(form);
    }

    return (
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h1 className="text-2xl font-bold text-white mb-1">Capi</h1>
            <p className="text-gray-400 text-sm mb-8">Inicia sesión en tu cuenta</p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                        placeholder="tu@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
                >
                    {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-slate-300 hover:underline">
                    Regístrate
                </Link>
            </p>
        </div>
    );
}