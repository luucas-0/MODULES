"use client";

import { useEffect, useState } from "react";
import { useScheduleContext } from "@/src/context/ScheduleContext";
import { useAuthContext } from "@/src/context/AuthContext";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { ScheduleForm } from "@/src/components/schedules/ScheduleForm";
import type { Schedule, CreateScheduleBody, UpdateScheduleBody } from "@/src/types/schedule";

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function DashboardPage() {
    const { user } = useAuthContext();
    const { schedules, isLoading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } =
        useScheduleContext();

    const [users, setUsers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Schedule | null>(null);
    const [deleting, setDeleting] = useState<Schedule | null>(null);
    const [actionPending, setActionPending] = useState(false);

    const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    useEffect(() => {
        if (canManage) {
            fetch("/api/users")
                .then((r) => r.json())
                .then((d) => setUsers(d.data ?? []));
        }
    }, [canManage]);

    async function handleCreate(data: CreateScheduleBody | UpdateScheduleBody) {
        const createData = data as CreateScheduleBody;
        await createSchedule(createData);
        setShowCreate(false);
    }

    async function handleEdit(data: CreateScheduleBody | UpdateScheduleBody) {
        if (!editing) return;
        const updateData = data as UpdateScheduleBody;
        await updateSchedule(editing.id, updateData);
        setEditing(null);
    }

    async function handleDelete() {
        if (!deleting) return;
        setActionPending(true);
        try {
            await deleteSchedule(deleting.id);
            setDeleting(null);
        } finally {
            setActionPending(false);
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Horarios</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {user?.role === "EMPLOYEE" ? "Tus turnos asignados" : "Gestión de horarios del equipo"}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setShowCreate(true)}>+ Nuevo horario</Button>
                )}
            </div>

            {/* Estados */}
            {isLoading && <p className="text-gray-400 text-center py-16">Cargando horarios...</p>}
            {error && (
                <p className="text-rose-300 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </p>
            )}

            {/* Tabla */}
            {!isLoading && !error && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    {schedules.length === 0 ? (
                        <p className="text-center text-gray-500 py-16">No hay horarios registrados</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-800 text-left">
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Empleado</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Inicio</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Fin</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                                {canManage && (
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                            {schedules.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white">
                                        {s.owner.firstName} {s.owner.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{s.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(s.startTime)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(s.endTime)}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={s.status === "ACTIVE" ? "success" : "danger"}>
                                            {s.status === "ACTIVE" ? "Activo" : "Cancelado"}
                                        </Badge>
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>
                                                    Editar
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => setDeleting(s)}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal Crear */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo horario">
                <ScheduleForm users={users} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} mode="create" />
            </Modal>

            {/* Modal Editar */}
            <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar horario">
                {editing && (
                    <ScheduleForm users={users} initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} mode="edit" />
                )}
            </Modal>

            {/* Modal Confirmar cancelación */}
            <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Cancelar horario">
                <p className="text-gray-300 text-sm mb-6">
                    ¿Estás seguro de cancelar el horario{" "}
                    <span className="text-white font-medium">&quot;{deleting?.title}&quot;</span>? Esta acción se registrará en auditoría.
                </p>
                <div className="flex gap-3">
                    <Button variant="danger" onClick={handleDelete} isLoading={actionPending} className="flex-1">
                        Sí, cancelar
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleting(null)}>
                        Volver
                    </Button>
                </div>
            </Modal>
        </div>
    );
}