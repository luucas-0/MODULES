import { z } from "zod";
import { roleValueEnum } from "./role.schemas";

export const createPermissionSchema = z.object({
    action: z.string().min(2, "Acción inválida").max(100),
    module: z.string().min(2, "Módulo inválido").max(100),
    role: roleValueEnum,
});

export const updatePermissionSchema = z.object({
    action: z.string().min(2, "Acción inválida").max(100).optional(),
    module: z.string().min(2, "Módulo inválido").max(100).optional(),
    role: roleValueEnum.optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
