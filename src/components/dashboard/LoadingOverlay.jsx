import { useEffect, useState } from 'react';
import { Layout, Search, BarChart3, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingOverlay({ progress, status }) {
    const [dots, setDots] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setIsVisible(false), 1000); // Give time for fade
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-6 transition-all duration-1000 ease-in-out",
            progress === 100 ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
        )}>
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-shikho-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-md w-full flex flex-col items-center">
                {/* Logo/Icon */}
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-shikho-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Layout className="w-10 h-10 text-shikho-500 relative z-10 animate-pulse" />

                    {/* Rotating Ring around icon */}
                    <div className="absolute inset-0 border-2 border-transparent border-t-shikho-500/40 border-r-shikho-500/40 rounded-3xl animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                {/* Brand Text */}
                <div className="text-center mb-10">
                    <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase mb-2">Internal Operations BI</p>
                    <h1 className="text-2xl font-black text-slate-100 tracking-tight">Program Dashboard</h1>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-900/50 border border-slate-800/50 rounded-full h-2.5 mb-4 overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <div
                        className="h-full bg-gradient-to-r from-shikho-600 via-shikho-400 to-shikho-500 transition-all duration-500 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Glossy Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                        {/* Animated Glow on progress edge */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/20 blur-md translate-x-1/2" />
                    </div>
                </div>

                {/* Status Text */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-2 min-w-[180px] justify-center">
                            {status.includes('Connecting') && <Clock className="w-3.5 h-3.5 text-shikho-500 animate-pulse" />}
                            {status.includes('Fetching') && <Search className="w-3.5 h-3.5 text-shikho-500 animate-pulse" />}
                            {status.includes('Processing') && <Layout className="w-3.5 h-3.5 text-shikho-500 animate-pulse" />}
                            {status.includes('Preparing') && <BarChart3 className="w-3.5 h-3.5 text-shikho-500 animate-pulse" />}
                            <span className="text-[11px] font-bold uppercase tracking-widest tabular-nums">
                                {status}{dots}
                            </span>
                        </div>
                        <span className="text-[11px] font-black text-shikho-500 tabular-nums min-w-[40px]">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Quote or Hint */}
                <div className="mt-16 text-slate-600 text-[10px] font-medium text-center opacity-60 italic">
                    "Ensuring operational excellence through real-time data insights."
                </div>
            </div>
        </div>
    );
}
