import type { Metadata } from "next";
import { AuthProvider } from "@/src/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capi",
  description: "Gestión de horarios para equipos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="es">
      <body>
      <AuthProvider>{children}</AuthProvider>
      </body>
      </html>
  );
}