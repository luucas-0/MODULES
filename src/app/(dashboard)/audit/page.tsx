"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import { userService } from "@/src/services/user.service";
import { Badge } from "@/src/components/ui/Badge";
import { redirect } from "next/navigation";
import type { AuditLog } from "@/src/types/user";

const actionBadge: Record<string, "success" | "danger" | "warning" | "info"> = {
    LOGIN: "success",
    LOGOUT: "info",
    USER_CREATED: "success",
    USER_UPDATED: "info",
    USER_DELETED: "danger",
    ROLE_CHANGED: "warning",
    SCHEDULE_CREATED: "success",
    SCHEDULE_UPDATED: "info",
    SCHEDULE_DELETED: "danger",
    PASSWORD_CHANGE: "warning",
};

export default function AuditPage() {
    const { user } = useAuthContext();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    if (user && user.role === "EMPLOYEE") redirect("/dashboard");

    useEffect(() => {
        userService.getAuditLogs(100)
            .then(setLogs)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Auditoría</h1>
                <p className="text-gray-400 text-sm mt-1">Registro completo de acciones en el sistema</p>
            </div>

            {isLoading && <p className="text-gray-400 text-center py-16">Cargando logs...</p>}

            {!isLoading && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    {logs.length === 0 ? (
                        <p className="text-center text-gray-500 py-16">Sin registros de auditoría</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-800 text-left">
                                {["Acción", "Usuario afectado", "Realizado por", "Tabla", "Fecha"].map((h) => (
                                    <th key={h} className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Badge variant={actionBadge[log.action] ?? "info"}>
                                            {log.action.replace(/_/g, " ")}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white">
                                        {log.subject.firstName} {log.subject.lastName}
                                        <span className="block text-xs text-gray-500">{log.subject.email}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "Sistema"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{log.tableName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(log.createdAt).toLocaleString("es-CO")}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}