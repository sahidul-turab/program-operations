import { Skeleton, Card } from '../ui';
import { cn } from '../../lib/utils';

export function KpiSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(9)].map((_, i) => (
                <Card key={i} className="relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-3 w-20 bg-slate-800/50" />
                            <Skeleton className="h-8 w-16 bg-slate-800" />
                        </div>
                        <Skeleton className="w-10 h-10 rounded-xl bg-slate-800/50" />
                    </div>
                    <div className="mt-4">
                        <Skeleton className="h-1.5 w-full bg-slate-800/30 overflow-hidden" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function FilterBarSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
            <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                <Skeleton className="h-10 w-full md:w-64 rounded-xl bg-slate-900" />
                <div className="flex flex-wrap gap-2 flex-1">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-xl bg-slate-900" />
                    ))}
                </div>
                <Skeleton className="h-10 w-24 rounded-xl bg-slate-900" />
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40 bg-slate-800" />
                    <Skeleton className="h-3 w-60 bg-slate-800/50" />
                </div>
                <Skeleton className="h-8 w-32 rounded-lg bg-slate-800" />
            </div>
            <div className="flex items-end gap-2 h-[300px] w-full mt-4">
                {[...Array(12)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 bg-slate-800/40 rounded-t-lg"
                        style={{
                            height: `${Math.random() * 80 + 20}%`,
                            opacity: (12 - i) / 12
                        }}
                    />
                ))}
            </div>
        </Card>
    );
}

export function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-slate-800" />
                    <Skeleton className="h-3 w-32 bg-slate-800/50" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg bg-slate-800" />
                    <Skeleton className="h-9 w-24 rounded-lg bg-slate-800" />
                </div>
            </div>
            <Card className="p-0 overflow-hidden border-slate-800/60">
                <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                    <div className="grid grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full bg-slate-800" />)}
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 py-1">
                            {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-4 w-full bg-slate-800/30" />)}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export function DashboardShellSkeleton() {
    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="max-w-screen-2xl mx-auto space-y-12">
                <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-10 w-64 bg-slate-900" />
                    <Skeleton className="h-10 w-40 bg-slate-900" />
                </div>
                <KpiSkeleton />
                <div className="space-y-12 mt-12">
                    <ChartSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                    <TableSkeleton />
                </div>
            </div>
        </div>
    );
}
