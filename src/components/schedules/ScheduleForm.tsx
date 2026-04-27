"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import type { CreateScheduleBody, UpdateScheduleBody, Schedule } from "@/src/types/schedule";

interface ScheduleFormProps {
    users: { id: string; firstName: string; lastName: string }[];
    initial?: Schedule;
    onSubmit: (data: CreateScheduleBody | UpdateScheduleBody) => Promise<void>;
    onCancel: () => void;
    mode: "create" | "edit";
}

function toDatetimeLocal(iso: string) {
    return new Date(iso).toISOString().slice(0, 16);
}

export function ScheduleForm({ users, initial, onSubmit, onCancel, mode }: ScheduleFormProps) {
    const [form, setForm] = useState({
        ownerId: initial?.ownerId ?? "",
        title: initial?.title ?? "",
        description: initial?.description ?? "",
        startTime: initial ? toDatetimeLocal(initial.startTime) : "",
        endTime: initial ? toDatetimeLocal(initial.endTime) : "",
    });
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (new Date(form.endTime) <= new Date(form.startTime)) {
            setError("La hora de fin debe ser posterior a la de inicio");
            return;
        }

        setIsPending(true);
        try {
            await onSubmit({
                ...form,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            });
        } catch (e: unknown) {
            setError("La hora de fin debe ser posterior a inicio");
        } finally {
            setIsPending(false);
        }
    }

    const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "create" && (
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Empleado</label>
                    <select name="ownerId" value={form.ownerId} onChange={onChange} required className={inputClass}>
                        <option value="">Seleccionar empleado</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.firstName} {u.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm text-gray-300 mb-1">Título</label>
                <input type="text" name="title" value={form.title} onChange={onChange} required className={inputClass} placeholder="Turno mañana" />
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción (opcional)</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={2} className={inputClass} placeholder="Notas adicionales..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Inicio</label>
                    <input type="datetime-local" name="startTime" value={form.startTime} onChange={onChange} required className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Fin</label>
                    <input type="datetime-local" name="endTime" value={form.endTime} onChange={onChange} required className={inputClass} />
                </div>
            </div>

            {error && (
                <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">
                    {error}
                </p>
            )}

            <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isPending} className="flex-1">
                    {mode === "create" ? "Crear horario" : "Guardar cambios"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}