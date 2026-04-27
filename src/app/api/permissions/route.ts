import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { createPermissionSchema } from "@/src/lib/validations/permission.schemas";
import type { ApiResponse } from "@/src/types/auth";

export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const permissions = await prisma.permission.findMany({ orderBy: [{ role: "asc" }, { module: "asc" }, { action: "asc" }] });
    return NextResponse.json<ApiResponse<typeof permissions>>({ success: true, message: "OK", data: permissions });
}

export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const body = await req.json();
    const parsed = parseBody(createPermissionSchema, body);
    if (!parsed.success) return parsed.response;

    const existing = await prisma.permission.findUnique({
        where: {
            action_module_role: {
                action: parsed.data.action,
                module: parsed.data.module,
                role: parsed.data.role,
            },
        },
    });
    if (existing) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "El permiso ya existe para este rol" },
            { status: 409 }
        );
    }

    const created = await prisma.permission.create({ data: parsed.data });
    return NextResponse.json<ApiResponse<typeof created>>(
        { success: true, message: "Permiso creado", data: created },
        { status: 201 }
    );
}
