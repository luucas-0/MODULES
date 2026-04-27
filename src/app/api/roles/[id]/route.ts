import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updateRoleSchema } from "@/src/lib/validations/role.schemas";
import type { ApiResponse } from "@/src/types/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const role = await prisma.roleMetadata.findUnique({ where: { id } });
    if (!role) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Rol no encontrado" },
            { status: 404 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updateRoleSchema, body);
    if (!parsed.success) return parsed.response;

    const updated = await prisma.roleMetadata.update({
        where: { id },
        data: parsed.data,
    });

    return NextResponse.json<ApiResponse<typeof updated>>({ success: true, message: "Rol actualizado", data: updated });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const role = await prisma.roleMetadata.findUnique({ where: { id } });
    if (!role) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Rol no encontrado" },
            { status: 404 }
        );
    }

    await prisma.roleMetadata.delete({ where: { id } });
    return NextResponse.json<ApiResponse>({ success: true, message: "Rol eliminado" });
}
