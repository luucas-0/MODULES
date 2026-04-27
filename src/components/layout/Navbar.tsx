"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

const roleBadge = { ADMIN: "danger", MANAGER: "warning", EMPLOYEE: "info" } as const;

export function Navbar() {
    const { user, handleLogout, isPending } = useAuth();
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Horarios", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
        { href: "/users", label: "Usuarios", roles: ["ADMIN"] },
        { href: "/roles", label: "Roles", roles: ["ADMIN"] },
        { href: "/audit", label: "Auditoría", roles: ["ADMIN", "MANAGER"] },
    ].filter((l) => user && l.roles.includes(user.role));

    return (
        <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <span className="text-white font-bold text-lg">Capi</span>
                    <div className="flex items-center gap-1">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    pathname === l.href
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:text-slate-100"
                                }`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {user && (
                    <div className="flex items-center gap-4">
                        <Badge variant={roleBadge[user.role]}>{user.role}</Badge>
                        <span className="text-gray-400 text-sm">{user.firstName} {user.lastName}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} isLoading={isPending}>
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}