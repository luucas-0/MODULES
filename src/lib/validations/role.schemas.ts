import { z } from "zod";

export const roleStatusEnum = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);
export const roleValueEnum = z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]);

export const createRoleSchema = z.object({
    role: roleValueEnum,
    name: z.string().min(2, "El nombre es obligatorio").max(50),
    description: z.string().max(255).optional(),
    status: roleStatusEnum.default("ACTIVE"),
});

export const updateRoleSchema = z.object({
    name: z.string().min(2, "El nombre es obligatorio").max(50).optional(),
    description: z.string().max(255).nullable().optional(),
    status: roleStatusEnum.optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleValue = z.infer<typeof roleValueEnum>;
export type RoleStatus = z.infer<typeof roleStatusEnum>;
