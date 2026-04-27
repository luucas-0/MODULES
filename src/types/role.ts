export type RoleValue = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type RoleStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface RoleMetadata {
    id: string;
    role: RoleValue;
    name: string;
    description: string | null;
    status: RoleStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleBody {
    role: RoleValue;
    name: string;
    description?: string;
    status?: RoleStatus;
}

export interface UpdateRoleBody {
    name?: string;
    description?: string | null;
    status?: RoleStatus;
}
