import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updateScheduleSchema } from "@/src/lib/validations/schedule.schemas";
import type { ApiResponse } from "@/src/types/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN", "MANAGER"]);
    if (guard) return guard;

    const schedule = await prisma.schedule.findUnique({
        where: { id, deletedAt: null },
    });

    if (!schedule) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Horario no encontrado" },
            { status: 404 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updateScheduleSchema, body);
    if (!parsed.success) return parsed.response;

    const oldValues = {
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
    };

    const updated = await prisma.schedule.update({
        where: { id },
        data: parsed.data,
        select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            ownerId: true,
            createdById: true,
            createdAt: true,
            updatedAt: true,
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: schedule.ownerId,
            actorId: user!.userId,
            action: "SCHEDULE_UPDATED",
            tableName: "schedules",
            recordId: id,
            oldValues,
            newValues: parsed.data,
        },
    });

    return NextResponse.json<ApiResponse<typeof updated>>({
        success: true,
        message: "Horario actualizado",
        data: updated,
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN", "MANAGER"]);
    if (guard) return guard;

    const schedule = await prisma.schedule.findUnique({
        where: { id, deletedAt: null },
    });

    if (!schedule) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Horario no encontrado" },
            { status: 404 }
        );
    }

    await prisma.schedule.update({
        where: { id },
        data: { status: "CANCELLED", deletedAt: new Date() },
    });

    await prisma.auditLog.create({
        data: {
            userId: schedule.ownerId,
            actorId: user!.userId,
            action: "SCHEDULE_DELETED",
            tableName: "schedules",
            recordId: id,
            oldValues: { title: schedule.title, status: schedule.status },
        },
    });

    return NextResponse.json<ApiResponse>({
        success: true,
        message: "Horario cancelado",
    });
}