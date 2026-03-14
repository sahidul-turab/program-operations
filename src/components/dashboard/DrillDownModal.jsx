import React from 'react';
import { X, Calendar, Clock, GraduationCap, Info } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { cn } from '../../lib/utils';

export function DrillDownModal({ isOpen, onClose, data, pointLabel, mode, dateContext }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <Card className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0f172a] border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h2 className="text-base sm:text-xl font-black text-slate-100 uppercase tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
                            Sessions active at {pointLabel}
                            <Badge variant="primary" className="h-5 px-1.5 font-black text-[9px] tracking-widest bg-shikho-500/20 text-shikho-400 border-none shrink-0">
                                {data?.length || 0} Total
                            </Badge>
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">
                                <GraduationCap className="w-3 h-3 text-shikho-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mode} MODE</span>
                            </div>
                            {dateContext && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">
                                    <Calendar className="w-3 h-3 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateContext}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-950/20">
                    {data && data.length > 0 ? (
                        <div className="space-y-3">
                            {data.map((item, idx) => (
                                <div key={idx} className="group p-3 sm:p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl hover:bg-slate-900/60 hover:border-slate-700/50 transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] sm:text-xs font-black text-slate-100 uppercase tracking-tight group-hover:text-shikho-400 transition-colors truncate">
                                                {item.batchName || item.course || 'N/A'}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">
                                                {item.type || (mode === 'Exam' ? 'Operational Exam' : 'Live Session')}
                                            </p>
                                        </div>
                                        <div className="flex flex-row md:flex-row flex-wrap items-center gap-2 sm:gap-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-full md:w-auto mt-2 md:mt-0">
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 bg-slate-800/20 px-2 py-1 sm:p-0 rounded-md sm:bg-transparent">
                                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600" />
                                                <span>{item.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 bg-slate-800/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-700/30 flex-1 sm:flex-none justify-center md:justify-start">
                                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-shikho-500" />
                                                <span>{item.startTime} - {item.endTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <Info className="w-10 h-10 text-slate-600 mb-4" />
                            <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No active sessions found at this timestamp</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        Point-Concurrency Logic: start ≤ {pointLabel} &lt; end
                    </p>
                    <Button variant="ghost" onClick={onClose} className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white">
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    );
}
