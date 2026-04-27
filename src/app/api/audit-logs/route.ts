import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import type { ApiResponse } from "@/src/types/auth";

export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN", "MANAGER"]);
    if (guard) return guard;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    // Manager solo ve logs de su equipo
    const where =
        user!.role === "MANAGER"
            ? { subject: { managerId: user!.userId } }
            : {};

    const logs = await prisma.auditLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            action: true,
            tableName: true,
            recordId: true,
            oldValues: true,
            newValues: true,
            ipAddress: true,
            createdAt: true,
            subject: { select: { id: true, firstName: true, lastName: true, email: true } },
            actor: { select: { id: true, firstName: true, lastName: true } },
        },
    });

    return NextResponse.json<ApiResponse<typeof logs>>({ success: true, message: "OK", data: logs });
}