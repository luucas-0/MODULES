import { fetcher } from "@/src/lib/fetcher";
import type { User, CreateUserBody, UpdateUserBody, AuditLog } from "@/src/types/user";

export const userService = {
    async getAll(): Promise<User[]> {
        return fetcher<User[]>("/api/users");
    },

    async create(data: CreateUserBody): Promise<User> {
        return fetcher<User>("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdateUserBody): Promise<User> {
        return fetcher<User>(`/api/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async remove(id: string): Promise<void> {
        return fetcher<void>(`/api/users/${id}`, { method: "DELETE" });
    },

    async getAuditLogs(limit = 50): Promise<AuditLog[]> {
        return fetcher<AuditLog[]>(`/api/audit-logs?limit=${limit}`);
    },
};