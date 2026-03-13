import { useState, useEffect, useMemo } from 'react';
import { X, Save, Plus, Trash2, Search, Info, ChevronRight, ChevronDown, ListFilter, Grid3X3, Layers } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { cn } from '../../lib/utils';
import { getSubjectCluster } from '../../lib/subjects';

export function SubjectMappingModal({ isOpen, onClose, rawSubjects, customMappings, onSave }) {
    const [mappings, setMappings] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('mapped'); // 'mapped', 'unmapped', or 'grouped'
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        if (isOpen) {
            setMappings({ ...customMappings });
        }
    }, [isOpen, customMappings]);

    const handleSave = () => {
        onSave(mappings);
        onClose();
    };

    const addMapping = (raw, mapped) => {
        setMappings(prev => ({ ...prev, [raw]: mapped }));
    };

    const removeMapping = (raw) => {
        const newMappings = { ...mappings };
        delete newMappings[raw];
        setMappings(newMappings);
    };

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const subjectStats = useMemo(() => {
        const mappedList = [];
        const unmappedList = [];
        const groups = {}; // { 'Bangla': ['Bangla 1st Paper', ...], 'Biology': [...] }

        rawSubjects.forEach(subject => {
            const clusters = getSubjectCluster(subject, mappings);
            const autoClusters = getSubjectCluster(subject, {});

            const isManual = !!mappings[subject];

            // It's mapped if it doesn't just return itself as a single item
            const isClustered = clusters.length > 1 || (clusters.length === 1 && clusters[0] !== subject) || isManual;

            if (isClustered) {
                mappedList.push({
                    raw: subject,
                    mapped: clusters.join(' + '),
                    type: isManual ? 'manual' : 'auto',
                    clusterArray: clusters
                });
                clusters.forEach(c => {
                    if (!groups[c]) groups[c] = [];
                    if (!groups[c].includes(subject)) groups[c].push(subject);
                });
            } else {
                unmappedList.push(subject);
            }
        });

        return {
            mapped: mappedList.sort((a, b) => a.raw.localeCompare(b.raw)),
            unmapped: [...new Set(unmappedList)].sort(),
            groups: Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
        };
    }, [rawSubjects, mappings]);

    const filteredMapped = subjectStats.mapped.filter(m =>
        m.raw.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mapped.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUnmapped = subjectStats.unmapped.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = subjectStats.groups.filter(([groupName, items]) =>
        groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <Card className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f172a] border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                            Subject Filter Mapping
                            <Badge variant="primary" className="h-5 px-1.5 font-black text-[9px] tracking-widest bg-shikho-500/20 text-shikho-400 border-none">
                                Settings
                            </Badge>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Group similar raw subject names into cleaner filter categories
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="px-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('mapped')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2",
                                activeTab === 'mapped' ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Grid3X3 className="w-3 h-3" />
                            Mapped ({subjectStats.mapped.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('grouped')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2",
                                activeTab === 'grouped' ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Layers className="w-3 h-3" />
                            Grouped ({subjectStats.groups.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('unmapped')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2",
                                activeTab === 'unmapped' ? "bg-shikho-500 text-white shadow-lg shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <ListFilter className="w-3 h-3" />
                            Unmapped ({subjectStats.unmapped.length})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search subjects or groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-slate-900/50 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-shikho-500/30"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'mapped' && (
                        <div className="space-y-4">
                            {filteredMapped.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest w-1/2">Raw Subject Name</th>
                                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Mapped Filter Entry</th>
                                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filteredMapped.map((m, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-800/20 transition-colors">
                                                <td className="py-4 px-4">
                                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{m.raw}</span>
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                            {m.clusterArray.map((c, ci) => (
                                                                <span key={ci} className="text-[9px] font-black text-shikho-400 bg-shikho-500/5 border border-shikho-500/20 px-2 py-0.5 rounded uppercase">{c}</span>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Override All..."
                                                            value={mappings[m.raw] || ''}
                                                            onChange={(e) => addMapping(m.raw, e.target.value)}
                                                            className="h-8 w-32 px-2 bg-slate-950 border border-slate-800 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest focus:outline-none focus:border-shikho-500/50"
                                                        />
                                                        {m.type === 'auto' ? (
                                                            <Badge variant="outline" className="text-[7px] border-emerald-500/20 text-emerald-500/60 uppercase">Auto</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[7px] border-amber-500/20 text-amber-500/60 uppercase">Manual</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    {mappings[m.raw] && (
                                                        <button
                                                            onClick={() => removeMapping(m.raw)}
                                                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                            title="Reset Override"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">No Mapped Subjects Found</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'grouped' && (
                        <div className="space-y-3">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map(([groupName, items], idx) => (
                                    <div key={idx} className="bg-slate-900/30 border border-slate-800/80 rounded-xl overflow-hidden">
                                        <div
                                            onClick={() => toggleGroup(groupName)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-shikho-500/10 rounded-lg flex items-center justify-center border border-shikho-500/20">
                                                    <Layers className="w-4 h-4 text-shikho-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">{groupName}</h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{items.length} Variants Mapped</p>
                                                </div>
                                            </div>
                                            {expandedGroups[groupName] ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                                        </div>

                                        {expandedGroups[groupName] && (
                                            <div className="px-4 pb-4 border-t border-slate-800/50 bg-[#0f172a]/50">
                                                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {items.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800/50 rounded-lg group/item">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate pr-4">{item}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeMapping(item);
                                                                }}
                                                                disabled={!mappings[item]}
                                                                className={cn(
                                                                    "p-1 rounded opacity-0 group-hover/item:opacity-100 transition-all",
                                                                    mappings[item] ? "text-rose-500 hover:bg-rose-500/10" : "text-slate-800 cursor-not-allowed"
                                                                )}
                                                                title="Reset Mapping"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">No Groups Found</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'unmapped' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredUnmapped.length > 0 ? (
                                filteredUnmapped.map((s, idx) => {
                                    const inputId = `map-to-${idx}`;
                                    const doAdd = () => {
                                        const input = document.getElementById(inputId);
                                        if (input && input.value) {
                                            addMapping(s, input.value);
                                            input.value = '';
                                        }
                                    };

                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight truncate max-w-[150px]">{s}</span>
                                                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Standalone</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id={inputId}
                                                    type="text"
                                                    placeholder="Map to..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            doAdd();
                                                        }
                                                    }}
                                                    className="h-8 w-32 px-2 bg-slate-950 border border-slate-800 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest placeholder:text-slate-700 focus:outline-none focus:border-shikho-500/50"
                                                />
                                                <button
                                                    onClick={doAdd}
                                                    className="p-2 text-slate-600 hover:text-shikho-500 hover:bg-shikho-500/10 rounded-lg transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">All Available Subjects are Mapped</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium italic">
                        <Info className="w-3.5 h-3.5" />
                        Tip: Composite subjects like "A + B" are automatically split into separate filters.
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="text-[10px] uppercase font-black tracking-widest text-slate-400">Cancel</Button>
                        <Button onClick={handleSave} className="bg-shikho-500 hover:bg-shikho-600 gap-2 h-10 px-6 rounded-lg text-white text-[10px] uppercase font-black tracking-widest shadow-lg shadow-shikho-500/20">
                            <Save className="w-3.5 h-3.5" />
                            Save Mappings
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
