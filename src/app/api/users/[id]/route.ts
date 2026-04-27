import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updateUserSchema } from "@/src/lib/validations/user.schemas";
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const actor = getRequestUser(req);
    const guard = requireRoles(actor, ["ADMIN"]);
    if (guard) return guard;

    const target = await prisma.user.findUnique({
        where: { id, deletedAt: null },
    });

    if (!target) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Usuario no encontrado" },
            { status: 404 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updateUserSchema, body);
    if (!parsed.success) return parsed.response;

    // Validar que el managerId apunte a un Manager real
    if (parsed.data.managerId) {
        const manager = await prisma.user.findUnique({
            where: { id: parsed.data.managerId, role: "MANAGER", deletedAt: null },
        });
        if (!manager) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "El manager seleccionado no existe o no tiene rol Manager" },
                { status: 400 }
            );
        }
    }

    const oldValues = {
        firstName: target.firstName,
        lastName: target.lastName,
        role: target.role,
        status: target.status,
        managerId: target.managerId
    };

    const updated = await prisma.user.update({
        where: { id },
        data: parsed.data,
        select: userSelect,
    });

    const action =
        parsed.data.role && parsed.data.role !== target.role
            ? "ROLE_CHANGED"
            : "USER_UPDATED";

    await prisma.auditLog.create({
        data: {
            userId: target.id,
            actorId: actor!.userId,
            action,
            tableName: "users",
            recordId: id,
            oldValues,
            newValues: parsed.data,
        },
    });

    return NextResponse.json<ApiResponse<typeof updated>>({
        success: true,
        message: "Usuario actualizado",
        data: updated,
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const actor = getRequestUser(req);
    const guard = requireRoles(actor, ["ADMIN"]);
    if (guard) return guard;

    if (actor!.userId === id) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No puedes eliminarte a ti mismo" },
            { status: 400 }
        );
    }

    const target = await prisma.user.findUnique({
        where: { id, deletedAt: null },
    });

    if (!target) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Usuario no encontrado" },
            { status: 404 }
        );
    }

    await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: "INACTIVE" },
    });

    await prisma.auditLog.create({
        data: {
            userId: target.id,
            actorId: actor!.userId,
            action: "USER_DELETED",
            tableName: "users",
            recordId: id,
            oldValues: { email: target.email, role: target.role },
        },
    });

    return NextResponse.json<ApiResponse>({
        success: true,
        message: "Usuario eliminado",
    });
}