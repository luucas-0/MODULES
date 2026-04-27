import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/src/types/auth";
import { prisma } from "@/src/lib/prisma";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface RequestUser {
    userId: string;
    email: string;
    role: Role;
}

// Extrae el usuario inyectado por el proxy
export function getRequestUser(req: NextRequest): RequestUser | null {
    const userId = req.headers.get("x-user-id");
    const email = req.headers.get("x-user-email");
    const role = req.headers.get("x-user-role") as Role | null;

    if (!userId || !email || !role) return null;
    return { userId, email, role };
}

// Guard: si el usuario no tiene uno de los roles permitidos, devuelve 403
export function requireRoles(
    user: RequestUser | null,
    allowed: Role[]
): NextResponse | null {
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }
    if (!allowed.includes(user.role)) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No tienes permisos para esta acción" },
            { status: 403 }
        );
    }
    return null; // null = pasó el guard
}

export async function requirePermission(
    user: RequestUser | null,
    action: string,
    module: string
): Promise<NextResponse | null> {
    const guard = requireRoles(user, ["ADMIN", "MANAGER", "EMPLOYEE"]);
    if (guard) return guard;

    const permission = await prisma.permission.findFirst({
        where: { action, module, role: user!.role },
    });

    if (!permission) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No tienes permisos para esta acción" },
            { status: 403 }
        );
    }

    return null;
}