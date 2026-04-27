import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .string({ error: "El email es obligatorio" })
        .email("Email inválido")
        .toLowerCase(),
    password: z
        .string({ error: "La contraseña es obligatoria" })
        .min(8, "Mínimo 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    firstName: z
        .string({ error: "El nombre es obligatorio" })
        .min(2, "Mínimo 2 caracteres")
        .max(50),
    lastName: z
        .string({ error: "El apellido es obligatorio" })
        .min(2, "Mínimo 2 caracteres")
        .max(50),
});

export const loginSchema = z.object({
    email: z.string({ error: "El email es obligatorio" }).email("Email inválido").toLowerCase(),
    password: z.string({ error: "La contraseña es obligatoria" }).min(1, "La contraseña es requerida"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;