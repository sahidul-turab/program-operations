import React from 'react';
import { Card, Badge, Button } from '../ui';
import { cn } from '../../lib/utils';
import {
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Layers,
    Monitor,
    BookOpen,
    ArrowRight,
    Zap,
    Users
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Reusable session detail card for conflicts
 */
const SessionDetail = ({ session, label }) => (
    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <Badge variant={session.eventCategory === 'Exam' ? 'danger' : 'primary'} className="text-[9px] font-black uppercase">
                {session.eventCategory || 'Session'}
            </Badge>
        </div>
        <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight mb-1">{session.subject}</h4>
            <p className="text-[10px] font-bold text-slate-500 truncate">{session.topic}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[10px] font-black text-slate-700 truncate">{session.startTime} - {session.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 truncate">{session.platform}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 truncate">{session.teacher}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 truncate">{session.batchName}</span>
            </div>
        </div>
    </div>
);

/**
 * Main Conflict Card
 */
const ConflictCard = ({ conflict }) => {
    const isTeacherConflict = conflict.type === 'Teacher Conflict';

    return (
        <Card className="overflow-hidden border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-50/50 p-4 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{conflict.type}</span>
                            <Badge variant="outline" className="border-rose-200 text-rose-600 bg-white font-black text-[9px]">
                                OVERLAP
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {isTeacherConflict ? 'Instructor' : 'Batch'}: <span className="text-rose-600 font-black">{conflict.involved}</span> on {conflict.date}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <SessionDetail session={conflict.session1} label="Session 1" />
                <div className="hidden md:flex justify-center absolute left-1/2 -ml-3 z-10">
                    <div className="p-1 bg-white ring-4 ring-rose-50 rounded-full border border-rose-200">
                        <ArrowRight className="w-4 h-4 text-rose-400" />
                    </div>
                </div>
                <SessionDetail session={conflict.session2} label="Session 2" />
            </div>
        </Card>
    );
};

/**
 * Schedule Conflicts View
 */
export const ConflictView = ({ conflicts }) => {
    if (!conflicts || conflicts.all.length === 0) {
        return (
            <Card className="p-12 flex flex-col items-center justify-center text-center border-emerald-100 bg-emerald-50/10">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Optimized</h3>
                <p className="text-sm font-bold text-slate-500 mt-2 max-w-sm">
                    No teacher or batch conflicts detected. Your current program schedule is operationally sound.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Conflicts</p>
                    <p className="text-2xl font-black text-rose-600">{conflicts.total}</p>
                </Card>
                <Card className="p-4 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Teacher Issues</p>
                    <p className="text-2xl font-black text-rose-500">{conflicts.teacherCount}</p>
                </Card>
                <Card className="p-4 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Batch Issues</p>
                    <p className="text-2xl font-black text-orange-500">{conflicts.batchCount}</p>
                </Card>
            </div>

            <div className="space-y-4">
                {conflicts.all.map((conflict, idx) => (
                    <ConflictCard key={idx} conflict={conflict} />
                ))}
            </div>
        </div>
    );
};

/**
 * Timeline Event Row
 */
const TimelineRow = ({ event, isLast }) => (
    <div className="flex gap-4 group">
        <div className="flex flex-col items-center shrink-0 w-24">
            <div className="text-[11px] font-black text-slate-900 whitespace-nowrap">{event.startTime}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{event.endTime}</div>
            {!isLast && <div className="w-px h-full bg-slate-100 mt-2 mb-2 group-hover:bg-slate-200 transition-colors" />}
        </div>

        <div className="flex-1 pb-6">
            <div className={cn(
                "p-4 rounded-xl border transition-all duration-300",
                event.eventCategory === 'Exam'
                    ? "bg-rose-50/30 border-rose-100 hover:border-rose-200"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
            )}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 leading-none">{event.subject}</h4>
                            <Badge variant={event.eventCategory === 'Exam' ? 'danger' : 'primary'} className="text-[8px] px-1 py-0.5 font-black uppercase">
                                {event.eventCategory}
                            </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{event.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100 font-bold text-[9px] px-2 py-0.5">
                            {event.platform}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400">
                            <User className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 truncate">{event.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400">
                            <Layers className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 truncate">{event.batchName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400">
                            <BookOpen className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400">
                            <Clock className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">{event.durationMinutes}m duration</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Timeline View
 */
export const TimelineView = ({ timelineData }) => {
    if (!timelineData || timelineData.length === 0) {
        return <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">No events found in timeline range</div>;
    }

    return (
        <div className="space-y-12">
            {timelineData.map((day, dayIdx) => (
                <div key={dayIdx} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-shikho-600 p-3 rounded-2xl text-white shadow-lg shadow-shikho-100">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1 border-b border-slate-100 pb-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {format(parseISO(day.date), 'EEEE, MMM dd')}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-shikho-400" />
                                    {day.stats.total} Total Events
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    {day.stats.exams} Exams
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    {day.stats.classes} Classes
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="ml-0 md:ml-4">
                        {day.events.map((event, eventIdx) => (
                            <TimelineRow
                                key={event.id}
                                event={event}
                                isLast={eventIdx === day.events.length - 1}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Operations Day Planner (Summary Cards)
 */
export const DayPlannerView = ({ timelineData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timelineData.slice(0, 8).map((day, idx) => (
                <Card key={idx} className="p-5 flex flex-col justify-between hover:border-shikho-200 transition-colors cursor-default border-slate-100">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day.day}</span>
                            <Badge className="bg-shikho-50 text-shikho-700 font-black text-[10px] border-shikho-100">
                                {format(parseISO(day.date), 'MMM dd')}
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs font-bold text-slate-500">Total Load</span>
                                <span className="text-xl font-black text-slate-900">{day.stats.total}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-shikho-500"
                                        style={{ width: `${(day.stats.classes / day.stats.total) * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-rose-500"
                                        style={{ width: `${(day.stats.exams / day.stats.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{day.stats.classes} Classes</span>
                                    <span>{day.stats.exams} Exams</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Batches</p>
                        <div className="flex flex-wrap gap-1.5">
                            {day.stats.topBatches.map((batch, bIdx) => (
                                <span key={bIdx} className="text-[9px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded truncate max-w-[100px]">
                                    {batch}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
