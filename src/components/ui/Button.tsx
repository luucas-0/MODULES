interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "danger" | "ghost";
    size?: "sm" | "md";
    isLoading?: boolean;
}

const variants = {
    primary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-slate-900 hover:bg-slate-800 text-white",
    ghost: "bg-slate-800 hover:bg-slate-700 text-slate-200",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
};

export function Button({
                           variant = "primary",
                           size = "md",
                           isLoading,
                           children,
                           disabled,
                           className = "",
                           ...props
                       }: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading ? "Cargando..." : children}
        </button>
    );
}