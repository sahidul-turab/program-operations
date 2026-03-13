import { useState, useMemo } from 'react';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Clock,
    SearchX,
    Table as TableIcon
} from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import { cn } from '../../lib/utils';
import { format, isValid, parseISO } from 'date-fns';

export function DataTable({ data, isLoading }) {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const exportCSV = () => {
        const headers = ["Date", "Day", "Start Time", "End Time", "Subject", "Topic", "Teacher", "Batch", "Type", "Platform"];
        const rows = sortedData.map(item => [
            item.date, item.day, item.startTime, item.endTime,
            item.subject, item.topic, item.teacher, item.batchName,
            item.type, item.platform
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `shikho_ops_ledger_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 w-full animate-pulse bg-slate-900/40 rounded-xl border border-slate-800" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 group">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-slate-800">
                    <SearchX className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-lg font-black text-slate-200 mb-1 uppercase tracking-tight">No matching operations</h3>
                <p className="text-[10px] font-bold text-slate-500 max-w-xs text-center uppercase tracking-widest">Adjust filters to audited strategic parameters</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-shikho-500/10 border border-shikho-500/20 rounded-lg flex items-center justify-center shadow-lg">
                        <TableIcon className="text-shikho-500 w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-200 tracking-tight uppercase">Master Ledger</h2>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{data.length} Total Audited Entries</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={exportCSV} className="h-9 px-4 font-black text-[10px] tracking-widest uppercase gap-2 hover:bg-shikho-500/10 text-shikho-400 rounded-lg border border-shikho-500/20 transition-all">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </Button>
            </div>

            <Card className="premium-card bg-slate-900/40 border-slate-800/60 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 bg-[#0f172a] z-20">
                            <tr className="border-b border-slate-800 shadow-sm">
                                <SortableHeader title="Timestamp" sortKey="date" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Start" sortKey="startTime" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Subject & Topic" sortKey="subject" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Instructor" sortKey="teacher" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Batch" sortKey="batchName" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Type" sortKey="type" config={sortConfig} onClick={handleSort} />
                                <SortableHeader title="Status" sortKey="eventCategory" config={sortConfig} onClick={handleSort} />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="py-3 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight">
                                                {isValid(parseISO(item.date)) ? format(parseISO(item.date), 'MMM dd, yyyy') : item.date}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{item.day}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-shikho-400 bg-shikho-500/5 px-2 py-1 rounded-md border border-shikho-500/10 inline-flex">
                                            <Clock className="w-3 h-3" />
                                            {item.startTime}
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 max-w-[240px]">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-tight group-hover:text-shikho-400 transition-colors truncate">{item.subject}</p>
                                            <p className="text-[9px] font-medium text-slate-500 truncate" title={item.topic}>{item.topic}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                                                {item.teacher.substring(0, 1).toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight truncate max-w-[120px]">{item.teacher}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className="text-[9px] font-black text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 uppercase tracking-tighter">
                                            {item.batchName}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6">
                                        <TypeBadge type={item.type} />
                                    </td>
                                    <td className="py-3 px-6">
                                        <Badge variant={item.eventCategory === 'Class' ? 'primary' : 'danger'} className={cn(
                                            "h-5 px-2 justify-center font-black text-[8px] uppercase tracking-widest border-none shadow-sm min-w-[50px]",
                                            item.eventCategory === 'Class' ? "bg-violet-500/20 text-violet-400" : "bg-rose-500/20 text-rose-400"
                                        )}>
                                            {item.eventCategory}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-900/50 border-t border-slate-800 p-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase">
                        Auditing <span className="text-slate-400 font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> — <span className="text-slate-400 font-black">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="text-slate-400 font-black">{sortedData.length}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="h-8 w-8 p-0 border border-slate-800 hover:bg-slate-800 text-slate-500"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                                }
                                if (pageNum <= 0) return null;
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "w-8 h-8 rounded-md text-[10px] font-black transition-all uppercase",
                                            currentPage === pageNum
                                                ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20"
                                                : "text-slate-500 hover:bg-slate-800 border border-transparent"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="h-8 w-8 p-0 border border-slate-800 hover:bg-slate-800 text-slate-500"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function SortableHeader({ title, sortKey, config, onClick }) {
    const active = config.key === sortKey;
    return (
        <th
            className={cn(
                "py-3.5 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer select-none transition-all",
                active ? "text-shikho-400 bg-shikho-500/5" : "hover:text-slate-300 hover:bg-slate-800/30"
            )}
            onClick={() => onClick(sortKey)}
        >
            <div className="flex items-center gap-2">
                {title}
                <ArrowUpDown className={cn("w-3 h-3 transition-opacity", active ? "opacity-100" : "opacity-30")} />
            </div>
        </th>
    );
}

function TypeBadge({ type }) {
    const variants = {
        'Lecture Class': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Exam': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Special Live': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        'Pre - Recorded': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        'Orientation': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Solving Class': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Guideline Session': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        'Guardian Seminar': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <span className={cn(
            "px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-widest whitespace-nowrap leading-none",
            variants[type] || 'bg-slate-800 text-slate-500 border-slate-700'
        )}>
            {type}
        </span>
    );
}
