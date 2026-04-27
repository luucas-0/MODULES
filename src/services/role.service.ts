import { fetcher } from "@/src/lib/fetcher";
import type { CreateRoleBody, RoleMetadata, UpdateRoleBody } from "@/src/types/role";

export const roleService = {
    async getAll(): Promise<RoleMetadata[]> {
        return fetcher<RoleMetadata[]>("/api/roles");
    },

    async create(data: CreateRoleBody): Promise<RoleMetadata> {
        return fetcher<RoleMetadata>("/api/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdateRoleBody): Promise<RoleMetadata> {
        return fetcher<RoleMetadata>(`/api/roles/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async remove(id: string): Promise<void> {
        return fetcher<void>(`/api/roles/${id}`, { method: "DELETE" });
    },
};
