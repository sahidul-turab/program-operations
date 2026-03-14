import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/dashboard/Header';
import { KpiCards } from './components/dashboard/KpiCards';
import { FilterBar } from './components/dashboard/FilterBar';
import { LoadingOverlay } from './components/dashboard/LoadingOverlay';
import {
  KpiSkeleton,
  ChartSkeleton,
  TableSkeleton,
  FilterBarSkeleton
} from './components/dashboard/DashboardSkeletons';

// Lazy load heavy components
const DailyScheduleView = lazy(() => import('./components/dashboard/DailyScheduleView').then(module => ({ default: module.DailyScheduleView })));

// Destructure from lazy modules
import { CourseVolumeChart, DistributionBarChart, ChartCard } from './components/dashboard/Analytics';

import { fetchScheduleData, getCachedScheduleData } from './lib/api';
import {
  getEventCategoryStats,
  getEventsByDayOfWeek,
  getTimeSlotDistribution,
  getExamDistribution,
  getTodayEvents,
  getPeakConcurrency,
  getTotalHours
} from './lib/aggregations';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, differenceInDays, addDays } from 'date-fns';
import { getSubjectCluster } from './lib/subjects';
import { SubjectMappingModal } from './components/dashboard/SubjectMappingModal';
import { DrillDownModal } from './components/dashboard/DrillDownModal';
import { Settings } from 'lucide-react';

import { AlertCircle, Layout } from 'lucide-react';
import { Button, Card, Badge } from './components/ui';
import { cn } from './lib/utils';

const INITIAL_FILTERS = {
  search: '',
  batches: [],
  teachers: [],
  subjects: [],
  startDate: '', // Will be set on load
  endDate: '',   // Will be set on load
  quickRange: 'Today',
};

function SectionHeader({ title, subtitle, count, extra }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 relative">
      <div className="space-y-0.5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-slate-100 tracking-tight">{title}</h2>
          {typeof count === 'number' && (
            <Badge variant="primary" className="h-5 px-1.5 font-black text-[9px] tracking-widest bg-shikho-500/20 text-shikho-400 border-none">
              {count}
            </Badge>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{subtitle}</p>
      </div>
      {extra && <div>{extra}</div>}
      <div className="absolute -bottom-px left-0 w-12 h-0.5 bg-shikho-500 rounded-full" />
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Connecting to API...');

  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [chartMode, setChartMode] = useState('Class');
  const [distMode, setDistMode] = useState('Class');
  const [chartAxis, setChartAxis] = useState('Date');
  const [hoursMode, setHoursMode] = useState('Class');
  const [hoursAxis, setHoursAxis] = useState('Date');

  // Subject Mapping Settings
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [customMappings, setCustomMappings] = useState(() => {
    try {
      const saved = localStorage.getItem('shikho_subject_mappings');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleSaveMappings = (newMappings) => {
    setCustomMappings(newMappings);
    localStorage.setItem('shikho_subject_mappings', JSON.stringify(newMappings));
  };

  // Drill-down State
  const [drillDownPoint, setDrillDownPoint] = useState(null);



  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setLoadingProgress(5);
    setLoadingStatus('Connecting to API...');

    const startTime = Date.now();

    const applyData = (scheduleData, instant = false) => {
      setData(scheduleData || []);
      setLastRefreshed(new Date());

      // Set initial date range if not set
      if (!filters.startDate) {
        const today = new Date();
        setFilters(prev => ({
          ...prev,
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        }));
      }

      if (instant) {
        setLoadingProgress(100);
        setLoadingStatus('Using optimized cached view...');
        setTimeout(() => setLoading(false), 300);
      } else {
        const elapsed = Date.now() - startTime;
        const minLoad = 1500;
        const remaining = Math.max(0, minLoad - elapsed);
        setTimeout(() => {
          setLoadingProgress(100);
          setLoadingStatus('Dashboard Ready');
          setTimeout(() => setLoading(false), 600);
        }, remaining);
      }
    };

    try {
      let dataLoadedFromCache = false;

      // 1. Try instant load from cache first
      if (!forceRefresh) {
        const cachedData = await getCachedScheduleData();
        if (cachedData && cachedData.length > 0) {
          applyData(cachedData, true);
          dataLoadedFromCache = true;
        }
      }

      // 2. Setup progress bar if not loaded instantly
      let progressTimer;
      if (!dataLoadedFromCache || forceRefresh) {
        progressTimer = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 30) return prev + 1.5;
            if (prev < 65) {
              setLoadingStatus('Fetching schedule data...');
              return prev + 0.8;
            }
            if (prev < 88) {
              setLoadingStatus('Processing records...');
              return prev + 0.4;
            }
            return prev;
          });
        }, 100);
      }

      // 3. Fetch data (will hit exact cache in api.js if < 15min, or hit network)
      const scheduleData = await fetchScheduleData(forceRefresh);
      if (progressTimer) clearInterval(progressTimer);

      // 4. Update the UI
      if (!dataLoadedFromCache || forceRefresh) {
        setLoadingProgress(92);
        setLoadingStatus('Preparing charts...');
        applyData(scheduleData, false);
      } else {
        // Silently update if we already showed cache without loaders
        setData(scheduleData || []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      if (!data.length) setError(err.message || 'Failed to fetch schedule data');
      setLoading(false);
      setLoadingProgress(100);
    }
  }, [filters.startDate, data.length]);

  useEffect(() => {
    loadData();
  }, []);

  const handleResetFilters = () => {
    const today = new Date();
    setFilters({
      ...INITIAL_FILTERS,
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd')
    });
  };

  // 1. Core structural filtering (the "context")
  const contextData = useMemo(() => {
    if (!data.length) return [];
    const start = filters.startDate ? startOfDay(parseISO(filters.startDate)) : null;
    const end = filters.endDate ? endOfDay(parseISO(filters.endDate)) : null;

    return data.filter(item => {
      if (start && end) {
        const itemDate = parseISO(item.date);
        if (!isWithinInterval(itemDate, { start, end })) return false;
      }
      if (filters.batches.length > 0) {
        const itemBatches = item.batchName ? item.batchName.toString().split(/[,&]/).map(b => b.trim()).filter(Boolean) : [];
        if (!filters.batches.some(b => itemBatches.includes(b))) return false;
      }
      if (filters.teachers.length > 0) {
        const itemTeachers = item.teacher ? item.teacher.toString().split(/[,&]/).map(t => t.trim()).filter(Boolean) : [];
        if (!filters.teachers.some(t => itemTeachers.includes(t))) return false;
      }
      if (filters.subjects.length > 0) {
        const itemRawSubjects = item.subject ? item.subject.toString().split(/[,&]/).map(s => s.trim()).filter(Boolean) : [];
        const itemClusteredSubjects = itemRawSubjects.flatMap(s => getSubjectCluster(s, customMappings));
        if (!filters.subjects.some(s => itemClusteredSubjects.includes(s))) return false;
      }
      return true;
    });
  }, [data, filters.startDate, filters.endDate, filters.batches, filters.teachers, filters.subjects]);

  // 2. Search filtering (the "drill-down")
  const filteredData = useMemo(() => {
    if (!contextData.length) return [];
    if (!filters.search) return contextData;

    const search = filters.search.toLowerCase();
    return contextData.filter(item =>
      item.subject?.toLowerCase().includes(search) ||
      item.teacher?.toLowerCase().includes(search) ||
      item.batchName?.toLowerCase().includes(search) ||
      item.topic?.toLowerCase().includes(search) ||
      item.type?.toLowerCase().includes(search)
    );
  }, [contextData, filters.search]);

  const drillDownClasses = useMemo(() => {
    if (!drillDownPoint || !filteredData.length) return [];

    // Use the same subset as analyticsData (Live Classes or Exams)
    const baseSet = filteredData.filter(i => {
      if (distMode === 'Class') {
        return i.eventCategory === 'Class' && !(i.type?.toLowerCase().includes('recorded'));
      }
      return i.eventCategory === 'Exam';
    });

    const targetMinutes = drillDownPoint.totalMinutes;

    // Handle Label-based drill down (fallback for exams)
    if (typeof targetMinutes === 'undefined') {
      return baseSet.filter(item => item.timeSlot === drillDownPoint.name);
    }

    return baseSet.filter(item => {
      if (!item.startTime || !item.startTime.includes(':') || !item.endTime || !item.endTime.includes(':')) return false;

      const [sH, sM] = item.startTime.split(':').map(p => parseInt(p, 10));
      const [eH, eM] = item.endTime.split(':').map(p => parseInt(p, 10));

      if (isNaN(sH) || isNaN(eH)) return false;

      const startTotal = sH * 60 + sM;
      const endTotal = eH * 60 + eM;

      // Same exact formula: start_time <= selected_time AND end_time > selected_time (exclusive end)
      return startTotal <= targetMinutes && endTotal > targetMinutes;
    });
  }, [drillDownPoint, filteredData, distMode]);

  const dateContext = useMemo(() => {
    if (filters.quickRange && filters.quickRange !== 'Custom') return filters.quickRange;
    if (!filters.startDate || !filters.endDate) return '';
    if (filters.startDate === filters.endDate) return format(parseISO(filters.startDate), 'dd MMM yyyy');
    return `${format(parseISO(filters.startDate), 'dd MMM')} - ${format(parseISO(filters.endDate), 'dd MMM')}`;
  }, [filters.quickRange, filters.startDate, filters.endDate]);

  const handleBarClick = (payload) => {
    if (payload) {
      setDrillDownPoint(payload);
    }
  };

  const uniqueValues = useMemo(() => {
    if (!data.length) return { batches: [], teachers: [], subjects: [], years: [] };

    const splitAndUnique = (key) => [...new Set(data.flatMap(item =>
      item[key] ? item[key].toString().split(/[,&]/).map(v => v.trim()).filter(Boolean) : []
    ))].sort();

    const subjects = [...new Set(data.flatMap(item =>
      item.subject ? item.subject.toString().split(/[,&]/).flatMap(v => getSubjectCluster(v.trim(), customMappings)).filter(Boolean) : []
    ))].sort();

    const rawSubjects = [...new Set(data.flatMap(item =>
      item.subject ? item.subject.toString().split(/[,&]/).map(v => v.trim()).filter(Boolean) : []
    ))].sort();

    const years = [...new Set(data.map(item => parseISO(item.date).getFullYear()).filter(Boolean))].sort((a, b) => b - a);

    return {
      batches: splitAndUnique('batchName'),
      teachers: splitAndUnique('teacher'),
      subjects,
      rawSubjects,
      years
    };
  }, [data, customMappings]);

  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    const start = filters.startDate ? startOfDay(parseISO(filters.startDate)) : startOfDay(new Date());
    const end = filters.endDate ? startOfDay(parseISO(filters.endDate)) : startOfDay(new Date());
    const totalDays = differenceInDays(end, start);
    let axisKey = chartAxis;
    if (axisKey === 'Date' && totalDays === 0) axisKey = 'Batch';
    const groups = {};
    if (axisKey === 'Date') {
      const isMonthly = totalDays >= 60;
      for (let i = 0; i <= totalDays; i++) {
        const current = addDays(start, i);
        const key = format(current, 'yyyy-MM-dd');
        const label = isMonthly ? format(current, 'MMM yyyy') : format(current, 'dd MMM');
        const fullLabel = isMonthly ? label : `${format(current, 'dd MMM')} (${format(current, 'eee')})`;
        groups[key] = { label, fullLabel, rawDate: key, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
      }
    }
    filteredData.forEach(item => {
      let keys = axisKey === 'Teacher' ? (item.teacher?.toString().split(/[,&]/).map(t => t.trim()).filter(Boolean) || ['Unknown Teacher']) :
        axisKey === 'Batch' ? (item.batchName?.toString().split(/[,&]/).map(b => b.trim()).filter(Boolean) || ['Unknown Batch']) : [item.date];
      if (axisKey === 'Teacher' && filters.teachers.length > 0) keys = keys.filter(t => filters.teachers.includes(t));
      if (axisKey === 'Batch' && filters.batches.length > 0) keys = keys.filter(b => filters.batches.includes(b));
      keys.forEach(key => {
        if (!groups[key]) groups[key] = { label: key, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
        const cat = item.eventCategory === 'Exam' ? 'Exam' : (item.type?.toLowerCase().includes('recorded') ? 'Recorded Class' : 'Live Class');
        groups[key][cat]++;
        groups[key].Total++;
      });
    });
    let result = Object.values(groups).map(r => ({ ...r, Total: chartMode === 'Class' ? (r['Live Class'] + r['Recorded Class']) : r['Exam'] })).filter(r => axisKey === 'Date' || r.Total > 0);
    if (axisKey === 'Date') {
      result.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
      if (totalDays >= 60) {
        const monthGroups = {};
        result.forEach(r => {
          if (!monthGroups[r.label]) monthGroups[r.label] = { label: r.label, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
          monthGroups[r.label]['Live Class'] += r['Live Class']; monthGroups[r.label]['Recorded Class'] += r['Recorded Class'];
          monthGroups[r.label]['Exam'] += r['Exam']; monthGroups[r.label].Total += r.Total;
        });
        return Object.values(monthGroups).sort((a, b) => new Date('01 ' + a.label) - new Date('01 ' + b.label));
      }
    } else result.sort((a, b) => b.Total - a.Total);
    return result;
  }, [filteredData, filters.startDate, filters.endDate, chartAxis, chartMode]);

  const hoursData = useMemo(() => {
    if (!filteredData.length) return [];
    const start = filters.startDate ? startOfDay(parseISO(filters.startDate)) : startOfDay(new Date());
    const end = filters.endDate ? startOfDay(parseISO(filters.endDate)) : startOfDay(new Date());
    const totalDays = differenceInDays(end, start);
    let axisKey = hoursAxis;
    if (axisKey === 'Date' && totalDays === 0) axisKey = 'Batch';
    const groups = {};
    if (axisKey === 'Date') {
      const isMonthly = totalDays >= 60;
      for (let i = 0; i <= totalDays; i++) {
        const current = addDays(start, i);
        const key = format(current, 'yyyy-MM-dd');
        const label = isMonthly ? format(current, 'MMM yyyy') : format(current, 'dd MMM');
        const fullLabel = isMonthly ? label : `${format(current, 'dd MMM')} (${format(current, 'eee')})`;
        groups[key] = { label, fullLabel, rawDate: key, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
      }
    }
    filteredData.forEach(item => {
      let keys = axisKey === 'Teacher' ? (item.teacher?.toString().split(/[,&]/).map(t => t.trim()).filter(Boolean) || ['Unknown Teacher']) :
        axisKey === 'Batch' ? (item.batchName?.toString().split(/[,&]/).map(b => b.trim()).filter(Boolean) || ['Unknown Batch']) : [item.date];
      if (axisKey === 'Teacher' && filters.teachers.length > 0) keys = keys.filter(t => filters.teachers.includes(t));
      if (axisKey === 'Batch' && filters.batches.length > 0) keys = keys.filter(b => filters.batches.includes(b));
      keys.forEach(key => {
        if (!groups[key]) groups[key] = { label: key, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
        const cat = item.eventCategory === 'Exam' ? 'Exam' : (item.type?.toLowerCase().includes('recorded') ? 'Recorded Class' : 'Live Class');
        const durationHours = (item.durationMinutes || 0) / 60;
        groups[key][cat] = Number((groups[key][cat] + durationHours).toFixed(1));
        groups[key].Total = Number((groups[key].Total + durationHours).toFixed(1));
      });
    });
    let result = Object.values(groups).map(r => ({ ...r, Total: hoursMode === 'Class' ? Number((r['Live Class'] + r['Recorded Class']).toFixed(1)) : r['Exam'] })).filter(r => axisKey === 'Date' || r.Total > 0);
    if (axisKey === 'Date') {
      result.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
      if (totalDays >= 60) {
        const monthGroups = {};
        result.forEach(r => {
          if (!monthGroups[r.label]) monthGroups[r.label] = { label: r.label, 'Live Class': 0, 'Recorded Class': 0, 'Exam': 0, Total: 0 };
          monthGroups[r.label]['Live Class'] = Number((monthGroups[r.label]['Live Class'] + r['Live Class']).toFixed(1));
          monthGroups[r.label]['Recorded Class'] = Number((monthGroups[r.label]['Recorded Class'] + r['Recorded Class']).toFixed(1));
          monthGroups[r.label]['Exam'] = Number((monthGroups[r.label]['Exam'] + r['Exam']).toFixed(1));
          monthGroups[r.label].Total = Number((monthGroups[r.label].Total + r.Total).toFixed(1));
        });
        return Object.values(monthGroups).sort((a, b) => new Date('01 ' + a.label) - new Date('01 ' + b.label));
      }
    } else result.sort((a, b) => b.Total - a.Total);
    return result;
  }, [filteredData, filters.startDate, filters.endDate, hoursAxis, hoursMode]);

  const kpis = useMemo(() => {
    if (!contextData.length) return { 
      totalEvents: 0, 
      totalLive: 0, 
      totalRecorded: 0, 
      totalExams: 0, 
      avgDailyClasses: 0, 
      avgDailyExams: 0,
      peakConcurrency: 0,
      totalHours: 0,
      activeBatches: 0
    };

    const liveClasses = contextData.filter(i => i.eventCategory === 'Class' && !(i.type?.toLowerCase().includes('recorded'))).length;
    const recordedClasses = contextData.filter(i => i.eventCategory === 'Class' && i.type?.toLowerCase().includes('recorded')).length;
    const exams = contextData.filter(i => i.eventCategory === 'Exam').length;
    const totalDays = Math.max(differenceInDays(parseISO(filters.endDate || format(new Date(), 'yyyy-MM-dd')), parseISO(filters.startDate || format(new Date(), 'yyyy-MM-dd'))) + 1, 1);
    
    // New Metrics
    const activeBatches = new Set(contextData.flatMap(item => 
      item.batchName ? item.batchName.toString().split(/[,&]/).map(b => b.trim()).filter(Boolean) : []
    )).size;

    return {
      totalEvents: contextData.length,
      totalLive: liveClasses,
      totalRecorded: recordedClasses,
      totalExams: exams,
      avgDailyClasses: ((liveClasses + recordedClasses) / totalDays).toFixed(1),
      avgDailyExams: (exams / totalDays).toFixed(1),
      peakConcurrency: getPeakConcurrency(contextData.filter(i => i.eventCategory === 'Class' && !(i.type?.toLowerCase().includes('recorded')))),
      totalHours: getTotalHours(contextData),
      activeBatches
    };
  }, [contextData, filters.startDate, filters.endDate]);

  const analyticsData = useMemo(() => {
    if (!filteredData.length) return null;
    // Only include Live Classes (exclude recorded) for distribution charts
    const classOnly = filteredData.filter(i =>
      i.eventCategory === 'Class' &&
      !(i.type?.toLowerCase().includes('recorded'))
    );
    const examOnly = filteredData.filter(i => i.eventCategory === 'Exam');
    const activeData = distMode === 'Class' ? classOnly : examOnly;
    return {
      byCategory: getEventCategoryStats(filteredData),
      byDay: getEventsByDayOfWeek(activeData),
      byTime: distMode === 'Exam' ? getExamDistribution(activeData) : getTimeSlotDistribution(activeData)
    };
  }, [filteredData, distMode]);

  const [scheduleTab, setScheduleTab] = useState('Class');

  const handleKpiClick = useCallback((key) => {
    const scheduleEl = document.getElementById('daily-schedule');

    if (key === 'totalLive') {
      setScheduleTab('Class');
      setFilters(prev => ({ ...prev, search: '' }));
    } else if (key === 'totalRecorded') {
      setScheduleTab('Class');
      setFilters(prev => ({ ...prev, search: 'Recorded' }));
    } else if (key === 'totalExams') {
      setScheduleTab('Exam');
      setFilters(prev => ({ ...prev, search: '' }));
    } else if (key === 'totalEvents') {
      setFilters(prev => ({ ...prev, search: '' }));
    }

    if (scheduleEl) {
      const offset = 100; // Account for sticky header
      const elementPosition = scheduleEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  if (error && data.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-8 bg-slate-900 border-slate-800 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-100 mb-2 uppercase tracking-tight">Sync Offline</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">{error}</p>
          <Button onClick={() => loadData(true)} className="w-full bg-shikho-500 hover:bg-shikho-600 text-white font-black h-11 rounded-xl uppercase tracking-widest shadow-lg shadow-shikho-500/20">Retry Connection</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-shikho-500/30 selection:text-white">
      <LoadingOverlay progress={loadingProgress} status={loadingStatus} />

      {(!lastRefreshed) ? (
        <FilterBarSkeleton />
      ) : (
        <div className="sticky top-0 z-50 group/filter">
          <FilterBar filters={filters} setFilters={setFilters} uniqueData={uniqueValues} onReset={handleResetFilters} />
          <button
            onClick={() => setIsMappingModalOpen(true)}
            className="absolute left-1/2 -bottom-2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-full p-1.5 text-slate-500 hover:text-shikho-400 hover:border-shikho-500/50 shadow-lg opacity-0 group-hover/filter:opacity-100 transition-all z-[60]"
            title="Subject Mapping Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      )}

      <SubjectMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        rawSubjects={uniqueValues.rawSubjects || []}
        customMappings={customMappings}
        onSave={handleSaveMappings}
      />

      <DrillDownModal
        isOpen={!!drillDownPoint}
        onClose={() => setDrillDownPoint(null)}
        data={drillDownClasses}
        pointLabel={drillDownPoint?.name}
        mode={distMode}
        dateContext={dateContext}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
        <Header lastRefreshed={lastRefreshed} onRefresh={() => loadData(true)} isLoading={loading} />

        {(!lastRefreshed) ? <KpiSkeleton /> : <KpiCards kpis={kpis} onCardClick={handleKpiClick} />}

        <div className="space-y-12 mt-8">
          <section>
            <SectionHeader
              title={`${chartAxis}-wise ${chartMode} Volume`}
              subtitle={`Distribution of ${chartMode.toLowerCase()}s by ${chartAxis.toLowerCase()}`}
              extra={
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1 scale-90 sm:scale-100 origin-right">
                    {['Date', 'Batch', 'Teacher'].map(a => {
                      const isSingleDay = filters.startDate && filters.endDate && filters.startDate === filters.endDate;
                      const isDisabled = (a === 'Teacher' && chartMode === 'Exam') || (a === 'Date' && isSingleDay);
                      return (
                        <button key={a} disabled={isDisabled || !lastRefreshed} onClick={() => setChartAxis(a)} className={cn("px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-widest", chartAxis === a ? "bg-shikho-500 text-white shadow-md shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300", isDisabled && "opacity-20 cursor-not-allowed")}>{a}</button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1 scale-90 sm:scale-100 origin-right">
                    {['Class', 'Exam'].map(m => {
                      const isDisabled = m === 'Exam' && chartAxis === 'Teacher';
                      return (
                        <button key={m} disabled={isDisabled || !lastRefreshed} onClick={() => setChartMode(m)} className={cn("px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-widest", chartMode === m ? "bg-shikho-500 text-white shadow-md shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300", isDisabled && "opacity-20 cursor-not-allowed")}>{m}</button>
                      );
                    })}
                  </div>
                </div>
              }
            />
            <div className="grid grid-cols-1 gap-6">
              {(!lastRefreshed || loading) ? <ChartSkeleton /> : <Suspense fallback={<ChartSkeleton />}><ChartCard title={`${chartMode} Volume Trend`} subtitle={`Granularity: ${differenceInDays(parseISO(filters.endDate), parseISO(filters.startDate)) >= 60 ? 'Monthly' : 'Daily'}`}><CourseVolumeChart data={chartData} mode={chartMode} /></ChartCard></Suspense>}
            </div>
          </section>

          <section>
            <SectionHeader
              title={`${hoursAxis}-wise ${hoursMode} Hours`}
              subtitle={`Total duration of ${hoursMode.toLowerCase()}s by ${hoursAxis.toLowerCase()}`}
              extra={
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1 scale-90 sm:scale-100 origin-right">
                    {['Date', 'Batch', 'Teacher'].map(a => {
                      const isSingleDay = filters.startDate && filters.endDate && filters.startDate === filters.endDate;
                      const isDisabled = (a === 'Teacher' && hoursMode === 'Exam') || (a === 'Date' && isSingleDay);
                      return (
                        <button key={a} disabled={isDisabled || !lastRefreshed} onClick={() => setHoursAxis(a)} className={cn("px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-widest", hoursAxis === a ? "bg-shikho-500 text-white shadow-md shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300", isDisabled && "opacity-20 cursor-not-allowed")}>{a}</button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1 scale-90 sm:scale-100 origin-right">
                    {['Class', 'Exam'].map(m => {
                      const isDisabled = m === 'Exam' && hoursAxis === 'Teacher';
                      return (
                        <button key={m} disabled={isDisabled || !lastRefreshed} onClick={() => setHoursMode(m)} className={cn("px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-widest", hoursMode === m ? "bg-shikho-500 text-white shadow-md shadow-shikho-500/20" : "text-slate-500 hover:text-slate-300", isDisabled && "opacity-20 cursor-not-allowed")}>{m}</button>
                      );
                    })}
                  </div>
                </div>
              }
            />
            <div className="grid grid-cols-1 gap-6">
              {(!lastRefreshed || loading) ? <ChartSkeleton /> : <Suspense fallback={<ChartSkeleton />}><ChartCard title={`${hoursMode} Duration Trend`} subtitle={`Granularity: ${differenceInDays(parseISO(filters.endDate), parseISO(filters.startDate)) >= 60 ? 'Monthly' : 'Daily'}`}><CourseVolumeChart data={hoursData} mode={hoursMode} /></ChartCard></Suspense>}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {(!lastRefreshed || loading) ? <><div className="lg:col-span-7"><ChartSkeleton /></div><div className="lg:col-span-3"><ChartSkeleton /></div></> :
              <Suspense fallback={<><div className="lg:col-span-7"><ChartSkeleton /></div><div className="lg:col-span-3"><ChartSkeleton /></div></>}>
                {analyticsData && (
                  <>
                    <div className="lg:col-span-7">
                      <ChartCard 
                        title="Time Distribution" 
                        subtitle={`${distMode} activity peaks`} 
                        extra={<div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-0.5 rounded-lg shrink-0 scale-90">{['Class', 'Exam'].map(m => (<button key={m} onClick={() => setDistMode(m)} className={cn("px-3 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-widest", distMode === m ? "bg-shikho-500 text-white" : "text-slate-500 hover:text-slate-300")}>{m}</button>))}</div>}
                      >
                        <DistributionBarChart data={analyticsData.byTime} onBarClick={handleBarClick} />
                      </ChartCard>
                    </div>
                    <div className="lg:col-span-3">
                      <ChartCard 
                        title="Day Distribution" 
                        subtitle={`Strategic ${distMode.toLowerCase()} distribution`} 
                        extra={<div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-0.5 rounded-lg shrink-0 scale-90">{['Class', 'Exam'].map(m => (<button key={m} onClick={() => setDistMode(m)} className={cn("px-3 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-widest", distMode === m ? "bg-shikho-500 text-white" : "text-slate-500 hover:text-slate-300")}>{m}</button>))}</div>}
                      >
                        <DistributionBarChart data={analyticsData.byDay} />
                      </ChartCard>
                    </div>
                  </>
                )}
              </Suspense>
            }
          </section>

          {(filters.startDate && filters.endDate) && (
            <Suspense fallback={<TableSkeleton />}>
              <DailyScheduleView data={filteredData} startDate={filters.startDate} endDate={filters.endDate} isLoading={loading && !lastRefreshed} activeTab={scheduleTab} setActiveTab={setScheduleTab} />
            </Suspense>
          )}
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-md relative overflow-hidden text-center">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col items-center">
          <div className="w-10 h-10 bg-shikho-500/10 rounded-xl flex items-center justify-center mb-6 border border-shikho-500/20">
            <Layout className="text-shikho-500 w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-2">Internal Operations BI Dashboard</p>
          <h4 className="text-sm font-black text-slate-100 tracking-tight">Shikho Technologies Bangladesh Limited</h4>
          <p className="text-[10px] text-slate-600 mt-6 font-medium">© 2026 Shikho Technologies Limited. All Rights Reserved. Confidential & Proprietary.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
