import { ScheduleProvider } from "@/src/context/ScheduleContext";
import { Navbar } from "@/src/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ScheduleProvider>
            <div className="min-h-screen bg-slate-950 text-white">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                </main>
            </div>
        </ScheduleProvider>
    );
}