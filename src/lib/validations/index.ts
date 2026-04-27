import { ZodSchema } from "zod";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/src/types/auth";

type ValidationErrors = Record<string, string[] | undefined>;

export function parseBody<T>(schema: ZodSchema<T>, data: unknown):
    | { success: true; data: T }
    | { success: false; response: NextResponse } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors: ValidationErrors = result.error.flatten().fieldErrors;
        // Tomamos el primer mensaje de cada campo
        const message: string = Object.values(errors)
            .flat()
            .filter(Boolean)[0] ?? "Datos inválidos";

        const responseBody: ApiResponse<ValidationErrors> = {
            success: false,
            message,
            data: errors,
        };

        return {
            success: false,
            response: NextResponse.json<ApiResponse<ValidationErrors>>(responseBody, { status: 422 }),
        };
    }

    return { success: true, data: result.data };
}