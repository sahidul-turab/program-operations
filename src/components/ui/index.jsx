import { cn } from "../../lib/utils"

export function Badge({ children, variant = "default", className }) {
    const variants = {
        default: "bg-slate-800 text-slate-300 border-slate-700",
        primary: "bg-shikho-500/20 text-shikho-400 border-shikho-500/20",
        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/20 text-amber-400 border-amber-500/20",
        danger: "bg-rose-500/20 text-rose-400 border-rose-500/20",
        info: "bg-sky-500/20 text-sky-400 border-sky-500/20",
        outline: "border border-slate-700 text-slate-500",
    }

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-widest whitespace-nowrap",
            variants[variant],
            className
        )}>
            {children}
        </span>
    )
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className,
    onClick,
    disabled = false,
    type = "button"
}) {
    const variants = {
        primary: "bg-shikho-600 text-white hover:bg-shikho-700 shadow-lg shadow-shikho-900/20",
        secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
        outline: "border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 shadow-sm",
        ghost: "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
        link: "text-shikho-500 hover:underline px-0",
    }

    const sizes = {
        sm: "h-8 px-3 text-[10px]",
        md: "h-10 px-4 text-xs",
        lg: "h-12 px-6 text-sm",
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center rounded-xl font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shikho-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96]",
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </button>
    )
}

export function Card({ children, className, onClick }) {
    return (
        <div
            onClick={onClick}
            className={cn("premium-card bg-[#0f172a]/60 backdrop-blur-md border border-slate-800/40 p-6", className)}
        >
            {children}
        </div>
    )
}

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-xl bg-slate-900 border border-slate-800", className)}
            {...props}
        />
    )
}
