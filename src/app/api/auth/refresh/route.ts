import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/src/lib/jwt";
import { prisma } from "@/src/lib/prisma";
import type { ApiResponse } from "@/src/types/auth";

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "No hay refresh token" },
                { status: 401 }
            );
        }

        const payload = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId, deletedAt: null, status: "ACTIVE" },
        });

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Usuario no encontrado" },
                { status: 401 }
            );
        }

        const newAccessToken = signAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json<ApiResponse>({
            success: true,
            message: "Token renovado",
        });

        response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
        });

        return response;
    } catch {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Refresh token inválido o expirado" },
            { status: 401 }
        );
    }
}