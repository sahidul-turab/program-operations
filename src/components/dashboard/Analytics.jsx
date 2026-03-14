import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ComposedChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    LabelList,
} from 'recharts';
import { Card, Badge } from '../ui';
import { Radio, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function ChartCard({ title, subtitle, children, className, extra }) {
    return (
        <Card className={cn("p-0 flex flex-col h-full premium-card border-slate-800/40 bg-[#020617]/50 shadow-2xl overflow-visible group", className)}>
            <div className="p-4 sm:p-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div>
                    <h3 className="text-[10px] sm:text-xs font-black text-slate-100 uppercase tracking-widest group-hover:text-shikho-400 transition-colors flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-shikho-500" />
                        {title}
                    </h3>
                    {subtitle && <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight line-clamp-1">{subtitle}</p>}
                </div>
                {extra && <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto overflow-y-hidden custom-scrollbar pb-1 sm:pb-0">{extra}</div>}
            </div>
            <div className="flex-1 min-h-[300px] sm:min-h-[350px] w-full p-2 sm:p-4 pt-2 flex flex-col">
                {children}
            </div>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const itemData = payload[0].payload || {};
        const displayLabel = itemData.fullLabel || label;

        return (
            <div className="bg-slate-900/95 backdrop-blur-2xl p-3 border border-slate-800 shadow-2xl rounded-xl flex flex-col gap-1.5 min-w-[150px]">
                <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest leading-none mb-2">{displayLabel}</p>
                <div className="h-px bg-slate-800 w-full mb-1" />
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.color || p.fill }} />
                            <span className="text-[10px] font-bold text-slate-400">{p.name}:</span>
                        </div>
                        <span className="text-xs font-black text-slate-50">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || value === 0) return null;

    // Only show if the bar is tall enough, otherwise show on top (simplified here to middle-or-hide)
    if (height < 10) return null;

    return (
        <g>
            <rect
                x={x + width / 2 - 12}
                y={y + height / 2 - 9}
                width={24}
                height={18}
                rx={6}
                fill="#0f172a"
                fillOpacity={0.8}
            />
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight="950"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
            >
                {value}
            </text>
        </g>
    );
};

export const CourseVolumeChart = React.memo(({ data, mode }) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">No Data in Range</div>;

    const isClassMode = mode === 'Class';
    const dataKeys = isClassMode ? ['Live Class', 'Recorded Class'] : ['Exam'];

    // Axis calculation
    const hasLongLabels = data.some(d => d.label && d.label.length > 12);
    const hasManyBars = data.length > 15;
    const shouldRotate = hasLongLabels || hasManyBars;
    const barWidth = hasManyBars ? 16 : (hasLongLabels ? 24 : 36);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={data}
                margin={{
                    top: 25,
                    right: 20,
                    left: -20,
                    bottom: shouldRotate ? 50 : 30
                }}
                barGap={0}
            >
                <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                            <text
                                x={0}
                                y={0}
                                dy={shouldRotate ? 10 : 16}
                                textAnchor={shouldRotate ? "end" : "middle"}
                                fill="#94a3b8"
                                fontSize={shouldRotate ? 9 : 10}
                                fontWeight={950}
                                transform={shouldRotate ? "rotate(-40)" : ""}
                                className="uppercase tracking-widest text-[9px]"
                            >
                                {payload.value}
                            </text>
                        </g>
                    )}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#475569' }}
                    domain={[0, 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="rect"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '0px', letterSpacing: '0.05em' }}
                />
                {dataKeys.map((key, idx) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={key === 'Live Class' ? '#6366f1' : key === 'Recorded Class' ? '#f59e0b' : '#f43f5e'}
                        radius={idx === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        barSize={barWidth}
                        animationDuration={1500}
                    >
                        <LabelList dataKey={key} content={<CustomBarLabel />} />
                    </Bar>
                ))}
                
                {mode && (
                    <Line
                        type="monotone"
                        dataKey="Total"
                        stroke="transparent"
                        strokeWidth={0}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                    >
                        <LabelList
                            dataKey="Total"
                            position="top"
                            fill="#f8fafc"
                            fontSize={11}
                            fontWeight="950"
                            offset={12}
                            style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}
                            formatter={(val) => val === 0 ? "0" : val}
                        />
                    </Line>
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
});


export function EventsByDateChart({ data }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">No Trend Data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                    minTickGap={40}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="count"
                    name="Total"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    animationDuration={1000}
                >
                    <LabelList dataKey="count" position="top" fill="#818cf8" fontSize={10} fontWeight="900" offset={15} />
                </Area>
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function CategoryPieChart({ data }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">No Data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                    animationDuration={1000}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.name === 'Class' ? '#818cf8' : entry.name === 'Exam' ? '#f472b6' : COLORS[index % COLORS.length]}
                        />
                    ))}
                    <LabelList dataKey="value" position="outside" fill="#94a3b8" fontSize={9} fontWeight="900" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px', color: '#94a3b8' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function TopBarChart({ data, color = "#818cf8" }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">No Data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 60, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                    width={100}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} content={<CustomTooltip />} />
                <Bar dataKey="value" name="Sessions" fill={color} radius={[0, 4, 4, 0]} barSize={12} animationDuration={1000}>
                    <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight="900" offset={12} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export const DistributionBarChart = ({ data, onBarClick }) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase tracking-widest">No Distribution Data</div>;

    const isLargeRange = data.length > 12;
    // Calculate dynamic width: base width or slot-based width
    const minWidth = isLargeRange ? data.length * 45 : '100%';

    return (
        <div className="w-full h-full overflow-x-auto custom-scrollbar overflow-y-hidden cursor-pointer" tabIndex={-1} style={{ outline: 'none' }}>
            <style>{`
                .recharts-wrapper:focus, .recharts-surface:focus { outline: none !important; }
                svg:focus { outline: none !important; }
            `}</style>
            <div style={{ minWidth: isLargeRange ? `${minWidth}px` : '100%', height: '100%', outline: 'none' }} className="outline-none" tabIndex={-1}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 30, right: 10, left: -20, bottom: 20 }}
                        style={{ outline: 'none' }}
                        tabIndex={-1}
                        onMouseDown={(state) => {
                            if (onBarClick && state && (state.activePayload || typeof state.activeTooltipIndex !== 'undefined')) {
                                const payload = (state.activePayload && state.activePayload.length)
                                    ? state.activePayload[0].payload
                                    : data[state.activeTooltipIndex];
                                if (payload) onBarClick(payload);
                            }
                        }}
                        onClick={(state) => {
                            if (!onBarClick) return;

                            // 1. Try activePayload (most accurate)
                            if (state && state.activePayload && state.activePayload.length) {
                                onBarClick(state.activePayload[0].payload);
                                return;
                            }

                            // 2. Fallback to activeTooltipIndex
                            if (state && typeof state.activeTooltipIndex !== 'undefined' && data[state.activeTooltipIndex]) {
                                onBarClick(data[state.activeTooltipIndex]);
                            }
                        }}
                    >
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={({ x, y, payload }) => (
                                <g transform={`translate(${x},${y})`}>
                                    <text
                                        x={0}
                                        y={0}
                                        dy={12}
                                        textAnchor="middle"
                                        fill="#64748b"
                                        fontSize={9}
                                        fontWeight={950}
                                        className="uppercase tracking-tighter"
                                    >
                                        {payload.value}
                                    </text>
                                </g>
                            )}
                            interval={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="value"
                            name="Volume"
                            fill="#818cf8"
                            radius={[4, 4, 0, 0]}
                            barSize={isLargeRange ? 20 : 32}
                            animationDuration={1000}
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{ outline: 'none' }}
                                />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="top"
                                fill="#f8fafc"
                                fontSize={11}
                                fontWeight="950"
                                offset={12}
                                style={{ stroke: 'rgba(2, 6, 23, 0.8)', strokeWidth: 4, strokeLinejoin: 'round', paintOrder: 'stroke', pointerEvents: 'none' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};



export function LeaderboardTable({ data, type = 'teacher' }) {
    if (!data || !data.length) return (
        <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
            <Radio className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Data Found</p>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40">
                        <th className="py-3 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{type === 'teacher' ? 'Instructor' : 'Batch'}</th>
                        <th className="py-3 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">Volume</th>
                        <th className="py-3 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{type === 'teacher' ? 'Load' : 'Composition'}</th>
                        <th className="py-3 px-6 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">Efficiency</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {data.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-700 w-4 tracking-tighter group-hover:text-shikho-500 transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">{item.name}</p>
                                        <p className="text-[9px] font-medium text-slate-600 uppercase tracking-tight truncate">Program Operations</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-center">
                                <Badge variant="primary" className="font-mono text-[9px] h-5 px-1.5 shadow-sm font-black bg-shikho-500/10 text-shikho-400 border-none">
                                    {item.sessions}
                                </Badge>
                            </td>
                            <td className="py-3 px-6 text-center">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                                    {type === 'teacher' ? `${item.batchCount || 0} Batches` : `${item.classes || 0}C / ${item.exams || 0}E`}
                                </span>
                            </td>
                            <td className="py-3 px-6 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-300">{item.avgDuration || 0}m</span>
                                    <div className="w-10 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-shikho-500/50 rounded-full" style={{ width: `${Math.min((item.avgDuration / 120) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function TimeStatCard({ label, value, subValue, icon: Icon, colorClass }) {
    return (
        <Card className="p-5 flex flex-col gap-3 h-full premium-card border-none bg-slate-900/40 group hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
                <div className={cn("p-1.5 rounded-lg transition-colors duration-300", colorClass)}>
                    <Icon className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-[7px] font-black px-1 py-0 border-slate-800 text-slate-500 tracking-widest uppercase">Live Intel</Badge>
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                <div className="flex items-baseline gap-1.5">
                    <p className="text-2xl font-black text-slate-100 tracking-tighter group-hover:text-shikho-400 transition-colors uppercase">{value}</p>
                    {subValue && <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{subValue}</span>}
                </div>
            </div>
        </Card>
    );
}

