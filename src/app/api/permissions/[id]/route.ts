import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updatePermissionSchema } from "@/src/lib/validations/permission.schemas";
import type { ApiResponse } from "@/src/types/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Permiso no encontrado" },
            { status: 404 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updatePermissionSchema, body);
    if (!parsed.success) return parsed.response;

    const updated = await prisma.permission.update({
        where: { id },
        data: parsed.data,
    });

    return NextResponse.json<ApiResponse<typeof updated>>({ success: true, message: "Permiso actualizado", data: updated });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Permiso no encontrado" },
            { status: 404 }
        );
    }

    await prisma.permission.delete({ where: { id } });
    return NextResponse.json<ApiResponse>({ success: true, message: "Permiso eliminado" });
}
