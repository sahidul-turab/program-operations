import {
    Calendar,
    GraduationCap,
    FileText,
    TrendingUp,
    Zap,
    Clock,
    Users
} from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../lib/utils';

export function KpiCards({ kpis, onCardClick }) {
    const cards = [
        {
            key: 'totalEvents',
            label: 'Total Event',
            value: kpis.totalEvents || 0,
            icon: Calendar,
            color: 'text-shikho-400',
            bg: 'bg-shikho-500/10'
        },
        {
            key: 'totalLive',
            label: 'Total Live Class',
            value: kpis.totalLive || 0,
            icon: GraduationCap,
            color: 'text-shikho-400',
            bg: 'bg-shikho-500/10'
        },
        {
            key: 'totalRecorded',
            label: 'Total Recorded Class',
            value: kpis.totalRecorded || 0,
            icon: GraduationCap,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10'
        },
        {
            key: 'totalExams',
            label: 'Total Exam',
            value: kpis.totalExams || 0,
            icon: FileText,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10'
        },
        {
            key: 'avgDailyClass',
            label: 'Average Daily Class',
            value: kpis.avgDailyClasses || 0,
            icon: TrendingUp,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10'
        },
        {
            key: 'avgDailyExam',
            label: 'Average Daily Exam',
            value: kpis.avgDailyExams || 0,
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
        },
        {
            key: 'peakConcurrency',
            label: 'Peak Live Concurrency',
            value: kpis.peakConcurrency || 0,
            icon: Zap,
            color: 'text-shikho-400',
            bg: 'bg-shikho-500/10'
        },
        {
            key: 'totalHours',
            label: 'Total Program Hours',
            value: kpis.totalHours || 0,
            icon: Clock,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        {
            key: 'activeBatches',
            label: 'Active Batches',
            value: kpis.activeBatches || 0,
            icon: Users,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10'
        }

    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={card.key}
                        onClick={() => onCardClick?.(card.key)}
                        className="relative group p-5 premium-card border-none bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer overflow-hidden active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn("p-3 rounded-xl transition-all duration-500 group-hover:scale-110 flex-shrink-0", card.bg)}>
                                <Icon className={cn("w-5 h-5", card.color)} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight mb-1 line-clamp-2">{card.label}</p>
                                <p className="text-2xl font-black text-slate-100 tracking-tight truncate leading-none">
                                    {card.value}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", card.color.replace('text-', 'bg-'))} style={{ width: '60%' }} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}


