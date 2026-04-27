import type { RoleValue } from "./role";

export interface Permission {
    id: string;
    action: string;
    module: string;
    role: RoleValue;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionBody {
    action: string;
    module: string;
    role: RoleValue;
}

export interface UpdatePermissionBody {
    action?: string;
    module?: string;
    role?: RoleValue;
}
