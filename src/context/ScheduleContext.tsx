"use client";

import { createContext, useContext, useState, useCallback, use } from "react";
import { scheduleService } from "@/src/services/schedule.service";
import type { Schedule, ScheduleContextType, CreateScheduleBody, UpdateScheduleBody } from "@/src/types/schedule";

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await scheduleService.getAll();
            setSchedules(data);
        } catch (e: unknown) {
            setError("Error al cargar los horarios");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSchedule = useCallback(async (data: CreateScheduleBody) => {
        const schedule = await scheduleService.create(data);
        setSchedules((prev) => [...prev, schedule]);
    }, []);

    const updateSchedule = useCallback(async (id: string, data: UpdateScheduleBody) => {
        const updated = await scheduleService.update(id, data);
        setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }, []);

    const deleteSchedule = useCallback(async (id: string) => {
        await scheduleService.remove(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
    }, []);

    return (
        <ScheduleContext.Provider value={{
            schedules, isLoading, error,
            fetchSchedules, createSchedule, updateSchedule, deleteSchedule,
        }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export function useScheduleContext() {
    const ctx = useContext(ScheduleContext);
    if (!ctx) throw new Error("useScheduleContext debe usarse dentro de <ScheduleProvider>");
    return ctx;
}