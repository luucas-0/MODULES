import { fetcher } from "@/src/lib/fetcher";
import type { CreatePermissionBody, Permission, UpdatePermissionBody } from "@/src/types/permission";

export const permissionService = {
    async getAll(): Promise<Permission[]> {
        return fetcher<Permission[]>("/api/permissions");
    },

    async create(data: CreatePermissionBody): Promise<Permission> {
        return fetcher<Permission>("/api/permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdatePermissionBody): Promise<Permission> {
        return fetcher<Permission>(`/api/permissions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async remove(id: string): Promise<void> {
        return fetcher<void>(`/api/permissions/${id}`, { method: "DELETE" });
    },
};
