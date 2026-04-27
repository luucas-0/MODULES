import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { createScheduleSchema } from "@/src/lib/validations/schedule.schemas";
import type { ApiResponse } from "@/src/types/auth";

const scheduleSelect = {
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
};

export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    // RBAC:
    // Employee → solo sus propios horarios
    // Manager  → horarios de su equipo (employees con managerId = user.userId)
    // Admin    → todos
    const where =
        user.role === "EMPLOYEE"
            ? { ownerId: user.userId, deletedAt: null }
            : user.role === "MANAGER"
                ? {
                    deletedAt: null,
                    OR: [
                        { owner: { managerId: user.userId } }, // horarios de su equipo
                        { ownerId: user.userId },               // sus propios horarios
                    ],
                }
                : { deletedAt: null }; // ADMIN ve todo

    const schedules = await prisma.schedule.findMany({
        where,
        select: scheduleSelect,
        orderBy: { startTime: "asc" },
    });

    return NextResponse.json<ApiResponse<typeof schedules>>({
        success: true,
        message: "OK",
        data: schedules,
    });
}

export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN", "MANAGER"]);
    if (guard) return guard;

    const body = await req.json();
    const parsed = parseBody(createScheduleSchema, body);
    if (!parsed.success) return parsed.response;

    const { ownerId, title, description, startTime, endTime } = parsed.data;

    // Validar que el Manager solo cree horarios para su equipo
    if (user!.role === "MANAGER") {
        const targetUser = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { managerId: true, role: true },
        });

        if (!targetUser || targetUser.managerId !== user!.userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Solo puedes crear horarios para tu equipo" },
                { status: 403 }
            );
        }
    }

    // Conflicto de horario
    const conflict = await prisma.schedule.findFirst({
        where: {
            ownerId,
            status: "ACTIVE",
            deletedAt: null,
            OR: [{ startTime: { lte: endTime }, endTime: { gte: startTime } }],
        },
    });

    if (conflict) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "El usuario ya tiene un horario en ese rango de tiempo" },
            { status: 409 }
        );
    }

    const schedule = await prisma.schedule.create({
        data: { ownerId, createdById: user!.userId, title, description, startTime, endTime },
        select: scheduleSelect,
    });

    await prisma.auditLog.create({
        data: {
            userId: ownerId,
            actorId: user!.userId,
            action: "SCHEDULE_CREATED",
            tableName: "schedules",
            recordId: schedule.id,
            newValues: { title, startTime, endTime },
        },
    });

    return NextResponse.json<ApiResponse<typeof schedule>>(
        { success: true, message: "Horario creado", data: schedule },
        { status: 201 }
    );
}