import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Clock,
    User,
    Layers,
    Monitor,
    BookOpen,
    FileText,
    Type,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';
import { format, parseISO, isValid, compareAsc, compareDesc, isToday } from 'date-fns';
import { Badge, Card, Button } from '../ui';
import { cn } from '../../lib/utils';

const formatDatePretty = (dateStr) => {
    if (!dateStr) return '';
    try {
        const dateObj = parseISO(dateStr);
        if (!isValid(dateObj)) return dateStr;
        return format(dateObj, 'dd-MMM-yyyy');
    } catch (e) {
        return dateStr;
    }
};

const formatTime12h = (timeStr) => {
    if (!timeStr || timeStr === 'N/A') return timeStr;
    try {
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;

        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);

        if (isNaN(h) || isNaN(m)) return timeStr;

        let hour = h % 12;
        if (hour === 0) hour = 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const minutes = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;

        return `${hour}${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

export function DailyScheduleView({ data, startDate, endDate, isLoading, activeTab, setActiveTab }) {
    const [sortConfig, setSortConfig] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const handleRequestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Reset page when category or data changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, data]);
    const sortedData = useMemo(() => {
        if (!data) return [];

        // Filter by category
        const filtered = data.filter(item =>
            item.eventCategory === activeTab
        );

        // Sort logic
        return [...filtered].sort((a, b) => {
            if (sortConfig) {
                const { key, direction } = sortConfig;
                let valA = a[key] || '';
                let valB = b[key] || '';

                if (key === 'date') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
            }

            // Default Multi-level Sorting
            // Date (Z to A)
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;

            if (activeTab === 'Class') {
                // Class: Start Time (A to Z)
                const startCompare = (a.startTime || '').localeCompare(b.startTime || '');
                if (startCompare !== 0) return startCompare;
                // Class: End Time (A to Z)
                return (a.endTime || '').localeCompare(b.endTime || '');
            } else {
                // Exam: Time Slot (A to Z)
                return (a.timeSlot || '').localeCompare(b.timeSlot || '');
            }
        });
    }, [data, activeTab, sortConfig]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const displayDate = useMemo(() => {
        if (!startDate || !endDate) return '';
        if (startDate === endDate) return formatDatePretty(startDate);
        return `${formatDatePretty(startDate)} - ${formatDatePretty(endDate)}`;
    }, [startDate, endDate]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-64 bg-slate-900 animate-pulse rounded-lg" />
                <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />
            </div>
        );
    }

    return (
        <section id="daily-schedule" className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 sm:pb-6 relative flex-wrap">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-shikho-500/10 rounded-xl border border-shikho-500/20">
                            <Calendar className="w-5 h-5 text-shikho-500" />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 tracking-tight">
                            {activeTab} Schedule
                        </h2>
                        <Badge variant="primary" className="h-5 px-1.5 font-black text-[9px] tracking-widest bg-shikho-500/20 text-shikho-400 border-none">
                            {sortedData.length} {activeTab === 'Class' ? 'Sessions' : 'Exams'}
                        </Badge>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-12 line-clamp-1">
                        Operational focus for <span className="text-shikho-400">{displayDate}</span>
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl shrink-0 relative z-50">
                    <button
                        onClick={() => {
                            setActiveTab('Class');
                            setSortConfig(null);
                        }}
                        className={cn(
                            "px-6 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2",
                            activeTab === 'Class'
                                ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        Class
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('Exam');
                            setSortConfig(null);
                        }}
                        className={cn(
                            "px-6 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2",
                            activeTab === 'Exam'
                                ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Exam
                    </button>
                </div>
                <div className="absolute -bottom-px left-0 w-24 h-0.5 bg-shikho-500 rounded-full" />
            </div>

            <Card className="premium-card bg-slate-900/40 border-slate-800/60 overflow-hidden shadow-2xl p-0">
                <div className="overflow-x-auto custom-scrollbar">
                    {sortedData.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#0f172a] border-b border-slate-800/80 sticky top-0 z-20 shadow-sm">
                                    {activeTab === 'Class' ? (
                                        <>
                                            <TableHeader label="Date" keyId="date" icon={<Calendar className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Start Time" keyId="startTime" icon={<Clock className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="End Time" keyId="endTime" icon={<Clock className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Subject" keyId="subject" icon={<BookOpen className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Topic" keyId="topic" icon={<FileText className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Teacher" keyId="teacher" icon={<User className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Course / Batch" keyId="batchName" icon={<Layers className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Class Type" keyId="type" icon={<Type className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Platform" keyId="platform" icon={<Monitor className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                        </>
                                    ) : (
                                        <>
                                            <TableHeader label="Date" keyId="date" icon={<Calendar className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Day" keyId="day" icon={<Calendar className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Time Duration" keyId="timeSlot" icon={<Clock className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Subject" keyId="subject" icon={<BookOpen className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Topic" keyId="topic" icon={<FileText className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Batch Name" keyId="batchName" icon={<Layers className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                            <TableHeader label="Exam Type" keyId="platform" icon={<Type className="w-3 h-3" />} sortConfig={sortConfig} onSort={handleRequestSort} />
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {paginatedData.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group border-b border-slate-800/20">
                                        {activeTab === 'Class' ? (
                                            <>
                                                <TableCell value={formatDatePretty(item.date)} isBold />
                                                <TableCell value={formatTime12h(item.startTime)} isTime />
                                                <TableCell value={formatTime12h(item.endTime)} isTime />
                                                <TableCell value={item.subject} isPrimary truncate />
                                                <TableCell value={item.topic} subtitle truncate />
                                                <TableCell value={item.teacher} isInstructor />
                                                <TableCell value={item.batchName} isBadge />
                                                <TableCell
                                                    value={item.type}
                                                    isTypeBadge
                                                    variant={item.type?.toLowerCase().includes('live') ? 'success' : 'default'}
                                                    icon={item.type?.toLowerCase().includes('live') ? <CheckCircle2 className="w-2.5 h-2.5" /> : <PlayCircle className="w-2.5 h-2.5" />}
                                                />
                                                <TableCell value={item.platform} isPlatformBadge />
                                            </>
                                        ) : (
                                            <>
                                                <TableCell value={formatDatePretty(item.date)} isBold />
                                                <TableCell value={item.day} isMuted />
                                                <TableCell value={item.timeSlot} isTimeRange />
                                                <TableCell value={item.subject} isPrimary truncate />
                                                <TableCell value={item.topic} subtitle truncate />
                                                <TableCell value={item.batchName} isBadge />
                                                <TableCell
                                                    value={item.platform}
                                                    isTypeBadge
                                                    variant="danger"
                                                />
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                                <FileText className="w-8 h-8 text-slate-700 opacity-20" />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No {activeTab}s Scheduled</h3>
                            <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tight">There are no operational entries for this category on the selected date</p>
                        </div>
                    )}
                </div>

                {sortedData.length > pageSize && (
                    <div className="px-4 sm:px-6 py-4 border-t border-slate-800 bg-[#0f172a]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                            Showing <span className="text-slate-300">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-slate-300">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="text-shikho-400">{sortedData.length}</span> {activeTab}s
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center",
                                                currentPage === pageNum
                                                    ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20"
                                                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </section>
    );
}

function TableHeader({ label, keyId, icon, sortConfig, onSort }) {
    const isSorted = sortConfig && sortConfig.key === keyId;
    const direction = isSorted ? sortConfig.direction : null;

    return (
        <th
            className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-800/50 transition-colors group/header"
            onClick={() => onSort(keyId)}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {icon}
                    {label}
                </div>
                {isSorted ? (
                    direction === 'asc' ? <ChevronUp className="w-3 h-3 text-shikho-500" /> : <ChevronDown className="w-3 h-3 text-shikho-500" />
                ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover/header:opacity-100 transition-opacity" />
                )}
            </div>
        </th>
    );
}

function TableCell({ value, subtitle, isBold, isPrimary, isTime, isTimeRange, isBadge, isTypeBadge, isPlatformBadge, isInstructor, isMuted, truncate, variant, icon }) {
    return (
        <td className="py-2.5 px-4">
            {isTime && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-shikho-400 bg-shikho-500/5 px-2 py-1 rounded-md border border-shikho-500/10 inline-flex">
                    <Clock className="w-3 h-3" />
                    {value}
                </div>
            )}
            {isTimeRange && (
                <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded-md border border-rose-500/10 inline-flex whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {value}
                </div>
            )}
            {isBadge && (
                <span className="text-[9px] font-black text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50 uppercase tracking-tight">
                    {value}
                </span>
            )}
            {isInstructor && (
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                        {value ? value.substring(0, 1).toUpperCase() : '?'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight truncate max-w-[120px]">{value}</span>
                </div>
            )}
            {isTypeBadge && (
                <Badge variant={variant || "primary"} className="text-[8px] px-2 py-0.5 font-black uppercase tracking-widest border-none gap-1.5 flex items-center w-fit">
                    {icon}
                    {value}
                </Badge>
            )}
            {isPlatformBadge && (
                <Badge variant="outline" className="text-[8px] px-2 py-0.5 font-black uppercase tracking-widest border-slate-800 text-slate-500 bg-slate-900/50">
                    {value}
                </Badge>
            )}
            {(!isTime && !isTimeRange && !isBadge && !isInstructor && !isTypeBadge && !isPlatformBadge) && (
                <div className={cn(
                    "flex flex-col",
                    truncate && "max-w-[200px]"
                )}>
                    <span
                        title={truncate && value ? value : undefined}
                        className={cn(
                            "uppercase tracking-tight",
                            truncate && "truncate",
                            isBold ? "text-[11px] font-bold text-slate-100" :
                                isPrimary ? "text-[11px] font-black text-shikho-400" :
                                    subtitle ? "text-[10px] font-medium text-slate-500 italic lowercase first-letter:uppercase" :
                                        isMuted ? "text-[11px] font-bold text-slate-600" :
                                            "text-[11px] font-medium text-slate-300"
                        )}
                    >
                        {value}
                    </span>
                </div>
            )}
        </td>
    );
}
