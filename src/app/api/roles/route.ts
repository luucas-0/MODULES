import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { createRoleSchema } from "@/src/lib/validations/role.schemas";
import type { ApiResponse } from "@/src/types/auth";

export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const roles = await prisma.roleMetadata.findMany({ orderBy: { role: "asc" } });
    return NextResponse.json<ApiResponse<typeof roles>>({ success: true, message: "OK", data: roles });
}

export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const body = await req.json();
    const parsed = parseBody(createRoleSchema, body);
    if (!parsed.success) return parsed.response;

    const existing = await prisma.roleMetadata.findUnique({ where: { role: parsed.data.role } });
    if (existing) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "El rol ya está configurado" },
            { status: 409 }
        );
    }

    const created = await prisma.roleMetadata.create({ data: parsed.data });
    return NextResponse.json<ApiResponse<typeof created>>(
        { success: true, message: "Rol creado", data: created },
        { status: 201 }
    );
}
