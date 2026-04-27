"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import { userService } from "@/src/services/user.service";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { redirect } from "next/navigation";
import type { User, CreateUserBody, UpdateUserBody } from "@/src/types/user";

const roleBadge = { ADMIN: "danger", MANAGER: "warning", EMPLOYEE: "info" } as const;
const statusBadge = { ACTIVE: "success", INACTIVE: "danger", SUSPENDED: "warning" } as const;
const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500";

export default function UsersPage() {
    const { user: me } = useAuthContext();
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<CreateUserBody>({
        email: "", password: "", firstName: "", lastName: "", role: "EMPLOYEE",
    });
    const [editForm, setEditForm] = useState<UpdateUserBody>({});

    if (me && me.role !== "ADMIN") redirect("/dashboard");

    useEffect(() => {
        userService.getAll()
            .then((all) => {
                setUsers(all);
                setManagers(all.filter((u) => u.role === "MANAGER"));
            })
            .catch((e) => setError(e.message))
            .finally(() => setIsLoading(false));
    }, []);

    function onCreateChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setCreateForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function onEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setEditForm((f) => ({
            ...f,
            [name]: name === "managerId" ? (value === "" ? null : value) : value,
        }));
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setIsPending(true);
        try {
            const created = await userService.create(createForm);
            setUsers((prev) => [created, ...prev]);
            setShowCreate(false);
            setCreateForm({ email: "", password: "", firstName: "", lastName: "", role: "EMPLOYEE" });
        } catch (e: unknown) {
            setFormError("Error al crear el usuario");
        } finally {
            setIsPending(false);
        }
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editing) return;
        setFormError(null);
        setIsPending(true);
        try {
            const updated = await userService.update(editing.id, editForm);
            setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
            // Actualizar lista de managers por si cambió un rol
            setManagers((prev) =>
                updated.role === "MANAGER"
                    ? prev.some((m) => m.id === updated.id) ? prev.map((m) => m.id === updated.id ? updated : m) : [...prev, updated]
                    : prev.filter((m) => m.id !== updated.id)
            );
            setEditing(null);
        } catch (e: unknown) {
            setFormError("Error al editar el usuario");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete() {
        if (!deleting) return;
        setIsPending(true);
        try {
            await userService.remove(deleting.id);
            setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
            setManagers((prev) => prev.filter((m) => m.id !== deleting.id));
            setDeleting(null);
        } catch (e: unknown) {
            setError("Error al eliminar el usuario");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Usuarios</h1>
                    <p className="text-gray-400 text-sm mt-1">Gestión de cuentas — solo Admin</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>+ Nuevo usuario</Button>
            </div>

            {isLoading && <p className="text-gray-400 text-center py-16">Cargando usuarios...</p>}
            {error && (
                <p className="text-rose-300 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm">{error}</p>
            )}

            {!isLoading && !error && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-800 text-left">
                            {["Nombre", "Email", "Rol", "Estado", "Manager", "Último login", "Acciones"].map((h) => (
                                <th key={h} className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-white">{u.firstName} {u.lastName}</td>
                                <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={roleBadge[u.role]}>{u.role}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={statusBadge[u.status]}>{u.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : "—"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString("es-CO") : "Nunca"}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => {
                                            setEditing(u);
                                            setEditForm({
                                                firstName: u.firstName,
                                                lastName: u.lastName,
                                                role: u.role,
                                                status: u.status,
                                                managerId: u.managerId ?? null,
                                            });
                                            setFormError(null);
                                        }}>
                                            Editar
                                        </Button>
                                        {u.id !== me?.id && (
                                            <Button size="sm" variant="danger" onClick={() => setDeleting(u)}>
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo usuario">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                            <input name="firstName" value={createForm.firstName} onChange={onCreateChange} required className={inputClass} placeholder="Juan" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Apellido</label>
                            <input name="lastName" value={createForm.lastName} onChange={onCreateChange} required className={inputClass} placeholder="Pérez" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Email</label>
                        <input type="email" name="email" value={createForm.email} onChange={onCreateChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
                        <input type="password" name="password" value={createForm.password} onChange={onCreateChange} required className={inputClass} placeholder="Mín. 8 chars, 1 mayúscula, 1 número" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Rol</label>
                        <select name="role" value={createForm.role} onChange={onCreateChange} className={inputClass}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    {formError && (
                        <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">{formError}</p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isPending} className="flex-1">Crear usuario</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Editar */}
            <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar usuario">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                            <input name="firstName" value={editForm.firstName ?? ""} onChange={onEditChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Apellido</label>
                            <input name="lastName" value={editForm.lastName ?? ""} onChange={onEditChange} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Rol</label>
                        <select name="role" value={editForm.role ?? ""} onChange={onEditChange} className={inputClass}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Estado</label>
                        <select name="status" value={editForm.status ?? ""} onChange={onEditChange} className={inputClass}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>

                    {/* Manager solo aparece si el usuario editado es Employee */}
                    {(editing?.role === "EMPLOYEE" || editForm.role === "EMPLOYEE") && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Manager asignado</label>
                            <select name="managerId" value={editForm.managerId ?? ""} onChange={onEditChange} className={inputClass}>
                                <option value="">Sin manager</option>
                                {managers.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.firstName} {m.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formError && (
                        <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">{formError}</p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isPending} className="flex-1">Guardar cambios</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Eliminar */}
            <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Eliminar usuario">
                <p className="text-gray-300 text-sm mb-6">
                    ¿Eliminar a <span className="text-white font-medium">{deleting?.firstName} {deleting?.lastName}</span>? Se hará soft delete y quedará registrado en auditoría.
                </p>
                <div className="flex gap-3">
                    <Button variant="danger" onClick={handleDelete} isLoading={isPending} className="flex-1">Sí, eliminar</Button>
                    <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
                </div>
            </Modal>
        </div>
    );
}