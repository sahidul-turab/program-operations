import { format, isValid, parseISO } from 'date-fns';
import {
    Calendar,
    Clock,
    User,
    Layers,
    PlayCircle,
    AlertCircle,
    ChevronRight,
    Monitor,
    BookOpen,
    Zap
} from 'lucide-react';
import { Badge, Card, Button } from '../ui';
import { cn } from '../../lib/utils';

export function EventCard({ item, compact = false }) {
    const isExam = item.eventCategory === 'Exam';
    const isClass = item.eventCategory === 'Class';

    return (
        <div className={cn(
            "relative group bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default overflow-hidden",
            compact ? "p-4" : "p-6",
            isExam ? "hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100/20" : "hover:border-shikho-200 hover:shadow-xl hover:shadow-shikho-100/20"
        )}>
            {/* Visual Indicator */}
            <div className={cn(
                "absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2",
                isExam ? "bg-rose-500" : "bg-shikho-500"
            )} />

            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none shadow-sm",
                                isExam ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
                            )}>
                                {item.type}
                            </Badge>
                            {item.platform && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tight bg-slate-50 border-slate-100 text-slate-500">
                                    <Monitor className="w-2.5 h-2.5 mr-1" />
                                    {item.platform}
                                </Badge>
                            )}
                        </div>
                        <h4 className="text-[15px] font-[900] text-slate-900 leading-snug mb-1 group-hover:text-shikho-600 transition-colors line-clamp-2" title={item.topic}>
                            {item.topic}
                        </h4>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{item.subject}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                        <div className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-2xl min-w-[70px] shadow-sm",
                            isExam ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-900"
                        )}>
                            <Clock className="w-4 h-4 mb-1" />
                            <span className="text-[11px] font-black">{item.startTime}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 scale-90 group-hover:scale-100 transition-transform">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-widest">Instructor</p>
                                <p className="text-[11px] font-black text-slate-700 truncate">{item.teacher}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>

                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 bg-shikho-50 rounded-lg flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-shikho-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-widest">Batch Group</p>
                            <p className="text-[11px] font-black text-slate-900 truncate">{item.batchName}</p>
                        </div>
                    </div>
                </div>

                {item.durationMinutes && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                        <div className="px-2 py-1 bg-slate-100 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {item.durationMinutes}m Session Duration
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TodaySchedule({ events }) {
    if (!events || events.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-20 bg-white border-none shadow-xl rounded-[2.5rem]">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-inner">
                    <Zap className="w-10 h-10 fill-current opacity-20" />
                </div>
                <h3 className="text-xl font-[900] text-slate-900 uppercase tracking-tight">Schedule Clear</h3>
                <p className="text-sm font-bold text-slate-500 mt-2 text-center max-w-xs leading-relaxed">
                    No program events are currently logged for the today's operational window.
                </p>
                <Button variant="outline" className="mt-8 rounded-xl font-black text-[10px] tracking-widest uppercase border-slate-200">View Future Load</Button>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
                <EventCard key={event.id} item={event} />
            ))}
        </div>
    );
}

export function UpcomingSchedule({ events }) {
    if (!events || events.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                <AlertCircle className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Operational Horizon Empty</p>
                <p className="text-xs font-bold text-slate-300 mt-2 uppercase tracking-widest">No scheduled activity for the next 7 days</p>
            </Card>
        );
    }

    const grouped = events.reduce((acc, curr) => {
        if (!acc[curr.date]) acc[curr.date] = [];
        acc[curr.date].push(curr);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="space-y-16">
            {sortedDates.map((dateStr) => {
                const dateObj = parseISO(dateStr);
                const displayDay = isValid(dateObj) ? format(dateObj, 'EEEE') : '';
                const displayDate = isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy') : dateStr;

                return (
                    <div key={dateStr} className="relative">
                        <div className="flex items-center gap-6 mb-8 relative">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-[900] text-slate-900 tracking-tighter uppercase leading-none">
                                    {displayDay}
                                </h3>
                                <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">{displayDate}</p>
                            </div>
                            <div className="h-px bg-slate-200 flex-1 opacity-50"></div>
                            <Badge variant="outline" className="h-8 px-4 font-black text-[10px] bg-white border-slate-200 text-slate-400 rounded-full tracking-widest uppercase shadow-sm">
                                {grouped[dateStr].length} Sessions
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {grouped[dateStr].map((event) => (
                                <EventCard key={event.id} item={event} compact />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
