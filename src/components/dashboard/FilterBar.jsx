import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Calendar, ChevronDown, Check, X } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { format, subDays, addDays, startOfYear, startOfMonth, startOfWeek, endOfDay } from 'date-fns';


export function FilterBar({ filters, setFilters, uniqueData, onReset }) {
    const years = uniqueData.years || [2025, 2026];

    const handleFilterChange = (name, value) => {
        setFilters(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'startDate' || name === 'endDate') {
                next.quickRange = '';
            }
            return next;
        });
    };


    const handleQuickRange = (range) => {
        const today = new Date();
        let start = today;
        let end = today;

        if (range === 'Today') {
            start = today;
            end = today;
        } else if (range === 'Yesterday') {
            start = subDays(today, 1);
            end = subDays(today, 1);
        } else if (range === 'Tomorrow') {
            start = addDays(today, 1);
            end = addDays(today, 1);
        } else if (range === 'Upcoming7') {
            start = today;
            end = addDays(today, 7);
        } else if (range === 'Upcoming15') {
            start = today;
            end = addDays(today, 15);
        } else if (range === '7D') {
            start = subDays(today, 6);
            end = today;
        } else if (range === '15D') {
            start = subDays(today, 14);
            end = today;
        } else if (range === '30D') {
            start = subDays(today, 29);
            end = today;
        } else if (range === 'MTD') {
            start = startOfMonth(today);
            end = today;
        } else if (range === 'YTD') {
            start = startOfYear(today);
            end = today;
        } else if (!isNaN(range) && range.toString().length === 4) {
            const yearNum = parseInt(range, 10);
            start = new Date(yearNum, 0, 1);
            end = new Date(yearNum, 11, 31);
        }

        setFilters(prev => ({
            ...prev,
            quickRange: range,
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd')
        }));
    };

    return (
        <div className="relative w-full bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 transition-all duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 py-2">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Section */}
                    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                        <select
                            className="bg-transparent text-xs font-bold text-slate-300 px-2 py-1 outline-none cursor-pointer hover:text-white transition-colors"
                            value={filters.quickRange || ''}
                            onChange={(e) => handleQuickRange(e.target.value)}
                        >
                            <option value="" disabled className="bg-slate-900">Period Filter</option>
                            <option value="Today" className="bg-slate-900">Today</option>
                            <option value="Yesterday" className="bg-slate-900">Yesterday</option>
                            <option value="Tomorrow" className="bg-slate-900">Tomorrow</option>
                            <option value="7D" className="bg-slate-900">Last 7 Days</option>
                            <option value="15D" className="bg-slate-900">Last 15 Days</option>
                            <option value="30D" className="bg-slate-900">Last 30 Days</option>
                            <option value="Upcoming7" className="bg-slate-900">Upcoming 7 Days</option>
                            <option value="Upcoming15" className="bg-slate-900">Upcoming 15 Days</option>
                            <option value="MTD" className="bg-slate-900">MTD</option>
                            <option value="YTD" className="bg-slate-900">YTD</option>
                            {years.map(y => (
                                <option key={y} value={y} className="bg-slate-900">{y}</option>
                            ))}
                        </select>
                        <div className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-2 px-2">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-slate-400 outline-none w-28 uppercase"
                            />
                            <span className="text-slate-600 text-[10px]">to</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-slate-400 outline-none w-28 uppercase"
                            />
                        </div>
                    </div>

                    {/* Multi-Select Filters */}
                    <div className="flex flex-wrap items-center gap-2 flex-grow">
                        <MultiSelect
                            label="Batches"
                            options={uniqueData.batches}
                            selected={filters.batches || []}
                            onChange={(vals) => handleFilterChange('batches', vals)}
                        />
                        <MultiSelect
                            label="Subjects"
                            options={uniqueData.subjects}
                            selected={filters.subjects || []}
                            onChange={(vals) => handleFilterChange('subjects', vals)}
                        />
                        <MultiSelect
                            label="Teachers"
                            options={uniqueData.teachers}
                            selected={filters.teachers || []}
                            onChange={(vals) => handleFilterChange('teachers', vals)}
                        />
                        <div className="relative min-w-[200px] flex-grow max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search schedule..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full h-9 pl-9 pr-4 bg-slate-900/50 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-shikho-500/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-9 px-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ml-auto"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MultiSelect({ label, options, selected, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (opt) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(item => item !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    const clearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectAllMatching = (e) => {
        e.stopPropagation();
        const newSelected = [...new Set([...selected, ...filteredOptions])];
        onChange(newSelected);
    };

    const deselectAllMatching = (e) => {
        e.stopPropagation();
        const newSelected = selected.filter(opt => !filteredOptions.includes(opt));
        onChange(newSelected);
    };

    const isAllMatchingSelected = filteredOptions.length > 0 && filteredOptions.every(opt => selected.includes(opt));
    const isAnyMatchingSelected = filteredOptions.some(opt => selected.includes(opt));

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-9 px-3 flex items-center justify-between gap-2 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all min-w-[140px]",
                    selected.length > 0 && "border-shikho-500/50 bg-shikho-500/5"
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", selected.length > 0 ? "text-shikho-400" : "text-slate-500")}>
                        {label}
                    </span>
                    {selected.length > 0 && (
                        <span className="bg-shikho-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                            {selected.length}
                        </span>
                    )}
                </div>
                <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-[60] flex flex-col p-1" style={{ animation: 'pageFadeIn 0.2s ease-out forwards' }}>
                    <div className="p-2 space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                            {selected.length > 0 && (
                                <button onClick={clearAll} className="text-[9px] font-bold text-shikho-400 hover:text-shikho-300">Clear All</button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                            <input
                                type="text"
                                placeholder={`Filter ${label}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-800 rounded-md text-[11px] font-medium text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-shikho-500/30"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto px-1 pb-1 custom-scrollbar">
                        {searchTerm === '' ? (
                            <div
                                onClick={() => onChange([])}
                                className={cn(
                                    "flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-bold uppercase tracking-tight",
                                    selected.length === 0 ? "text-shikho-400 bg-shikho-500/10" : "text-slate-400 hover:bg-slate-800/50"
                                )}
                            >
                                All {label}
                                {selected.length === 0 && <Check className="w-3 h-3" />}
                            </div>
                        ) : (
                            <div className="px-1 py-1 mb-1 border-b border-slate-800 flex flex-col gap-1">
                                {filteredOptions.length > 0 && !isAllMatchingSelected && (
                                    <button
                                        onClick={selectAllMatching}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-shikho-500/10 text-shikho-400 text-[10px] font-bold uppercase transition-colors text-left"
                                    >
                                        <Check className="w-3 h-3" />
                                        Select All Matching ({filteredOptions.length})
                                    </button>
                                )}
                                {isAnyMatchingSelected && (
                                    <button
                                        onClick={deselectAllMatching}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase transition-colors text-left"
                                    >
                                        <X className="w-3 h-3" />
                                        Clear Matching Selection
                                    </button>
                                )}
                            </div>
                        )}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => toggleOption(opt)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium",
                                        selected.includes(opt) ? "text-shikho-400 bg-shikho-500/10" : "text-slate-300 hover:bg-slate-800/50"
                                    )}
                                >
                                    <span className="truncate">{opt}</span>
                                    {selected.includes(opt) && <Check className="w-3 h-3" />}
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Matches</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

