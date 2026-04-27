import { fetcher } from "@/src/lib/fetcher";
import type { Schedule, CreateScheduleBody, UpdateScheduleBody } from "@/src/types/schedule";

const BASE = "/api/schedules";

export const scheduleService = {
    async getAll(): Promise<Schedule[]> {
        return fetcher<Schedule[]>(BASE);
    },

    async create(data: CreateScheduleBody): Promise<Schedule> {
        return fetcher<Schedule>(BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdateScheduleBody): Promise<Schedule> {
        return fetcher<Schedule>(`${BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async remove(id: string): Promise<void> {
        return fetcher<void>(`${BASE}/${id}`, { method: "DELETE" });
    },
};