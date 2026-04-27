import { User } from "@/generated/prisma/client";

export interface Schedule {
    id: string;
    ownerId: string;
    createdById: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    status: "ACTIVE" | "CANCELLED";
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface ScheduleContextType {
    schedules: Schedule[];
    isLoading: boolean;
    error: string | null;
    fetchSchedules: () => Promise<void>;
    createSchedule: (data: CreateScheduleBody) => Promise<void>;
    updateSchedule: (id: string, data: UpdateScheduleBody) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
}

export interface CreateScheduleBody {
    ownerId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
}

export interface UpdateScheduleBody {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    status?: "ACTIVE" | "CANCELLED";
}
