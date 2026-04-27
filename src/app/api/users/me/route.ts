import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import type { ApiResponse, AuthUser } from "@/src/types/auth";

export async function GET(req: NextRequest) {
    // El proxy ya validó el token e inyectó los headers
    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null, status: "ACTIVE" },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
        },
    });

    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Usuario no encontrado" },
            { status: 404 }
        );
    }

    return NextResponse.json<ApiResponse<AuthUser>>({
        success: true,
        message: "OK",
        data: user as AuthUser,
    });
}