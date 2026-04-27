interface BadgeProps {
    variant: "success" | "danger" | "warning" | "info";
    children: React.ReactNode;
}

const variants = {
    success: "bg-slate-800 text-slate-200 border-slate-700",
    danger: "bg-slate-900 text-slate-200 border-slate-700",
    warning: "bg-slate-800 text-slate-200 border-slate-700",
    info: "bg-slate-950 text-slate-300 border-slate-700",
};

export function Badge({ variant, children }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
    );
}