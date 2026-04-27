import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/src/lib/jwt";
import { loginSchema } from "@/src/lib/validations/auth.schemas";
import { parseBody } from "@/src/lib/validations";
import type { ApiResponse, AuthUser } from "@/src/types/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validación con Zod
        const parsed = parseBody(loginSchema, body);
        if (!parsed.success) return parsed.response;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email, deletedAt: null },
        });

        // Mensaje genérico para no revelar si el email existe
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        if (user.status !== "ACTIVE") {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Cuenta suspendida o inactiva" },
                { status: 403 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                actorId: user.id,
                action: "LOGIN",
                tableName: "users",
                recordId: user.id,
                ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
            },
        });

        const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id });

        const response = NextResponse.json<ApiResponse<AuthUser>>({
            success: true,
            message: "Login exitoso",
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
            },
        });

        response.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
        });

        response.cookies.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}