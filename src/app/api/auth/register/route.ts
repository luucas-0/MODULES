import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/src/lib/jwt";
import { registerSchema } from "@/src/lib/validations/auth.schemas";
import { parseBody } from "@/src/lib/validations";
import type { ApiResponse, AuthUser } from "@/src/types/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validación con Zod
        const parsed = parseBody(registerSchema, body);
        if (!parsed.success) return parsed.response;

        const { email, password, firstName, lastName } = parsed.data;

        // Email duplicado
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "El email ya está registrado" },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { email, passwordHash, firstName, lastName },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                actorId: user.id,
                action: "USER_CREATED",
                tableName: "users",
                recordId: user.id,
                newValues: { email, firstName, lastName, role: user.role },
            },
        });

        const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id });

        const response = NextResponse.json<ApiResponse<AuthUser>>(
            {
                success: true,
                message: "Usuario registrado exitosamente",
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                },
            },
            { status: 201 }
        );

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
        console.error("Register error:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}