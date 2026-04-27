import jwt, {SignOptions} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface JWTPayload {
    userId: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export function signAccessToken(payload: JWTPayload) {
    return jwt.sign(payload, JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        } as SignOptions);
}

export function signRefreshToken(payload: Pick<JWTPayload, "userId">): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    } as SignOptions);
}

export function verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): Pick<JWTPayload, "userId"> {
    return jwt.verify(token, JWT_REFRESH_SECRET) as Pick<JWTPayload, "userId">;
}