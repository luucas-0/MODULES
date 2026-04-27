import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { createUserSchema } from "@/src/lib/validations/user.schemas";
import type { ApiResponse } from "@/src/types/auth";

const userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    status: true,
    managerId: true,
    manager: { select: { id: true, firstName: true, lastName: true } },
    lastLogin: true,
    createdAt: true,
};

export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN", "MANAGER"]);
    if (guard) return guard;

    // Manager solo ve su equipo
    const where =
        user!.role === "MANAGER"
            ? { deletedAt: null, managerId: user!.userId }
            : { deletedAt: null };

    const users = await prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof users>>({ success: true, message: "OK", data: users });
}

export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const body = await req.json();
    const parsed = parseBody(createUserSchema, body);
    if (!parsed.success) return parsed.response;

    const { email, password, firstName, lastName, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "El email ya está registrado" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
        data: { email, passwordHash, firstName, lastName, role },
        select: userSelect,
    });

    await prisma.auditLog.create({
        data: {
            userId: newUser.id,
            actorId: user!.userId,
            action: "USER_CREATED",
            tableName: "users",
            recordId: newUser.id,
            newValues: { email, firstName, lastName, role },
        },
    });

    return NextResponse.json<ApiResponse<typeof newUser>>(
        { success: true, message: "Usuario creado", data: newUser },
        { status: 201 }
    );
}