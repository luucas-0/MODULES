import { z } from "zod";

export const createScheduleSchema = z.object({
    ownerId: z.string().uuid("ID de usuario inválido"),
    title: z.string().min(3, "Mínimo 3 caracteres").max(100),
    description: z.string().max(500).optional(),
    startTime: z.coerce.date({ error: "Fecha de inicio obligatoria" }),
    endTime: z.coerce.date({ error: "Fecha de fin obligatoria" }),
}).refine((d) => d.endTime > d.startTime, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
});

export const updateScheduleSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
}).refine((d) => {
    if (d.startTime && d.endTime) return d.endTime > d.startTime;
    return true;
}, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;