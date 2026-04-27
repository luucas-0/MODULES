"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuthContext } from "@/src/context/AuthContext";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { roleService } from "@/src/services/role.service";
import { permissionService } from "@/src/services/permission.service";
import type { RoleMetadata, CreateRoleBody, UpdateRoleBody } from "@/src/types/role";
import type { Permission, CreatePermissionBody, UpdatePermissionBody } from "@/src/types/permission";

const statusBadge = { ACTIVE: "success", INACTIVE: "danger", SUSPENDED: "warning" } as const;
const roleBadge = { ADMIN: "danger", MANAGER: "warning", EMPLOYEE: "info" } as const;

export default function RolesPage() {
    const { user } = useAuthContext();
    const [roles, setRoles] = useState<RoleMetadata[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleMetadata | null>(null);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [roleForm, setRoleForm] = useState<CreateRoleBody>({
        role: "EMPLOYEE",
        name: "",
        description: "",
        status: "ACTIVE",
    });
    const [permissionForm, setPermissionForm] = useState<CreatePermissionBody>({
        action: "",
        module: "",
        role: "EMPLOYEE",
    });

    if (user && user.role !== "ADMIN") redirect("/dashboard");

    useEffect(() => {
        Promise.all([roleService.getAll(), permissionService.getAll()])
            .then(([rolesResponse, permissionsResponse]) => {
                setRoles(rolesResponse);
                setPermissions(permissionsResponse);
            })
            .catch((e) => setError(e.message ?? "Error al cargar datos"))
            .finally(() => setIsLoading(false));
    }, []);

    function resetForms() {
        setFormError(null);
        setRoleForm({ role: "EMPLOYEE", name: "", description: "", status: "ACTIVE" });
        setPermissionForm({ action: "", module: "", role: "EMPLOYEE" });
        setEditingRole(null);
        setEditingPermission(null);
    }

    function onRoleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setRoleForm((current) => ({ ...current, [name]: value }));
    }

    function onPermissionChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setPermissionForm((current) => ({ ...current, [name]: value }));
    }

    async function handleRoleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setIsPending(true);

        try {
            if (editingRole) {
                const updated = await roleService.update(editingRole.id, {
                    name: roleForm.name,
                    description: roleForm.description,
                    status: roleForm.status,
                });
                setRoles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                const created = await roleService.create(roleForm);
                setRoles((prev) => [created, ...prev]);
            }
            setShowRoleModal(false);
            resetForms();
        } catch (e: unknown) {
            setFormError("Error al guardar el rol");
        } finally {
            setIsPending(false);
        }
    }

    async function handlePermissionSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setIsPending(true);

        try {
            if (editingPermission) {
                const updated = await permissionService.update(editingPermission.id, permissionForm);
                setPermissions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                const created = await permissionService.create(permissionForm);
                setPermissions((prev) => [created, ...prev]);
            }
            setShowPermissionModal(false);
            resetForms();
        } catch (e: unknown) {
            setFormError("Error al guardar el permiso");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDeleteRole(id: string) {
        setIsPending(true);
        try {
            await roleService.remove(id);
            setRoles((prev) => prev.filter((item) => item.id !== id));
        } catch (e: unknown) {
            setError("Error al eliminar el rol");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDeletePermission(id: string) {
        setIsPending(true);
        try {
            await permissionService.remove(id);
            setPermissions((prev) => prev.filter((item) => item.id !== id));
        } catch (e: unknown) {
            setError("Error al eliminar el permiso");
        } finally {
            setIsPending(false);
        }
    }

    const availableRoles = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Roles y Permisos</h1>
                    <p className="text-gray-400 text-sm mt-1">Administrador: gestión de roles, permisos y asignaciones.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { resetForms(); setShowRoleModal(true); }}>
                        + Nuevo rol
                    </Button>
                    <Button onClick={() => { resetForms(); setShowPermissionModal(true); }}>
                        + Nuevo permiso
                    </Button>
                </div>
            </div>

            {isLoading && <p className="text-gray-400 text-center py-16">Cargando roles y permisos...</p>}
            {error && (
                <p className="text-rose-300 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm">{error}</p>
            )}

            {!isLoading && !error && (
                <div className="space-y-10">
                    <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800">
                            <h2 className="text-lg font-semibold text-white">Roles</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left">
                                        {['Rol', 'Nombre', 'Descripción', 'Estado', 'Acciones'].map((h) => (
                                            <th key={h} className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-white">{role.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{role.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{role.description || 'Sin descripción'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusBadge[role.status]}>{role.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => {
                                                        setEditingRole(role);
                                                        setRoleForm({
                                                            role: role.role,
                                                            name: role.name,
                                                            description: role.description ?? "",
                                                            status: role.status,
                                                        });
                                                        setFormError(null);
                                                        setShowRoleModal(true);
                                                    }}>
                                                        Editar
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDeleteRole(role.id)}>
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800">
                            <h2 className="text-lg font-semibold text-white">Permisos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left">
                                        {['Acción', 'Módulo', 'Rol', 'Creado', 'Acciones'].map((h) => (
                                            <th key={h} className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {permissions.map((permission) => (
                                        <tr key={permission.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-white">{permission.action}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{permission.module}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={roleBadge[permission.role]}>{permission.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(permission.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => {
                                                        setEditingPermission(permission);
                                                        setPermissionForm({
                                                            action: permission.action,
                                                            module: permission.module,
                                                            role: permission.role,
                                                        });
                                                        setFormError(null);
                                                        setShowPermissionModal(true);
                                                    }}>
                                                        Editar
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDeletePermission(permission.id)}>
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editingRole ? "Editar rol" : "Nuevo rol"}>
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Rol</label>
                        <select name="role" value={roleForm.role} onChange={onRoleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500">
                            {availableRoles.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                        <input name="name" value={roleForm.name} onChange={onRoleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Descripción</label>
                        <input name="description" value={roleForm.description ?? ""} onChange={onRoleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Estado</label>
                        <select name="status" value={roleForm.status} onChange={onRoleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500">
                            {Object.keys(statusBadge).map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    {formError && <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">{formError}</p>}
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isPending} className="flex-1">Guardar rol</Button>
                        <Button type="button" variant="ghost" onClick={() => { setShowRoleModal(false); resetForms(); }}>Cancelar</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)} title={editingPermission ? "Editar permiso" : "Nuevo permiso"}>
                <form onSubmit={handlePermissionSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Acción</label>
                        <input name="action" value={permissionForm.action} onChange={onPermissionChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Módulo</label>
                        <input name="module" value={permissionForm.module} onChange={onPermissionChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Rol asociado</label>
                        <select name="role" value={permissionForm.role} onChange={onPermissionChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500">
                            {availableRoles.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    {formError && <p className="text-rose-300 text-sm bg-slate-950 border border-slate-700 rounded-lg px-4 py-2">{formError}</p>}
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isPending} className="flex-1">Guardar permiso</Button>
                        <Button type="button" variant="ghost" onClick={() => { setShowPermissionModal(false); resetForms(); }}>Cancelar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
