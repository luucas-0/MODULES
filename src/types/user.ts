export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    managerId: string | null;
    manager?: { id: string; firstName: string; lastName: string } | null;
    lastLogin: string | null;
    createdAt: string;
}

export interface CreateUserBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export interface UpdateUserBody {
    firstName?: string;
    lastName?: string;
    role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    managerId?: string | null;
}

export interface AuditLog {
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
    subject: { id: string; firstName: string; lastName: string; email: string };
    actor: { id: string; firstName: string; lastName: string } | null;
}