import { format } from 'date-fns';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button, Badge } from '../ui';
import { cn } from '../../lib/utils';

export function Header({ lastRefreshed, onRefresh, isLoading }) {
    return (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-10">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-shikho-500/10 border border-shikho-500/20 rounded-xl flex items-center justify-center shadow-lg group transition-all shrink-0 mt-1 sm:mt-0">
                    <LayoutDashboard className="text-shikho-400 w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
                        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-100 uppercase leading-none">
                            Shikho <span className="text-shikho-500 block sm:inline mt-1 sm:mt-0 sm:text-2xl">Program Schedule Dashboard</span>
                        </h1>
                        <Badge variant="outline" className="hidden sm:inline-flex h-4 px-1.5 font-black text-[7px] bg-slate-900 border-slate-800 text-slate-500 tracking-widest uppercase">Internal BI</Badge>
                    </div>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed mt-2 sm:mt-0">
                        Internal Operations Intelligence & Schedule Management
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4 bg-slate-900/40 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-800/50 sm:border-none">
                <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Operational</span>
                    </div>
                    {lastRefreshed && (
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tight mt-0.5">
                            Last Sync: {format(lastRefreshed, 'hh:mm:ss a')}
                        </span>
                    )}
                </div>
                <div className="w-px h-6 bg-slate-800 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-9 px-4 font-black uppercase text-[9px] tracking-widest gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg active:scale-95 transition-all"
                >
                    <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>
        </header>
    );
}
