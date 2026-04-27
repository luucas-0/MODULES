import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/src/lib/jwt";

const PUBLIC_ROUTES = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Rutas públicas pasan sin verificación
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    const token = req.cookies.get("access_token")?.value;

    if (!token) {
        // Si es API, devolver 401; si es página, redirigir
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const payload = verifyAccessToken(token);
        // Inyectar headers para que los route handlers los lean
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", payload.userId);
        requestHeaders.set("x-user-email", payload.email);
        requestHeaders.set("x-user-role", payload.role);

        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
        // Token expirado → intentar con refresh automático
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { success: false, message: "Token expirado", code: "TOKEN_EXPIRED" },
                { status: 401 }
            );
        }
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("access_token");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};