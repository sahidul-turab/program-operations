import { format, parseISO, isToday, addDays, isWithinInterval, startOfDay, endOfDay, compareAsc } from 'date-fns';
import { getSubjectCluster } from './subjects';

/**
 * Aggregates events by date for a line/area chart
 */
export const getEventsByDate = (data) => {
    const counts = data.reduce((acc, curr) => {
        const d = curr.date;
        if (d) acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));
};

/**
 * Aggregates by category (Class vs Exam)
 */
export const getEventCategoryStats = (data) => {
    const stats = data.reduce((acc, curr) => {
        const cat = curr.eventCategory || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
};

/**
 * Aggregates by a specified key (Batch, Teacher, Subject, etc.)
 */
export const getTopStats = (data, key, limit = 10, customMappings = {}) => {
    const counts = data.reduce((acc, curr) => {
        const rawVal = curr[key];
        if (!rawVal || rawVal === 'N/A') return acc;

        // If the key is 'teacher', we need to split and give credit to each
        if (key === 'teacher') {
            const names = rawVal.split(/[,&]/).map(n => n.trim()).filter(Boolean);
            names.forEach(name => {
                acc[name] = (acc[name] || 0) + 1;
            });
        } else if (key === 'subject') {
            const subjects = rawVal.split(/[,&]/).flatMap(s => getSubjectCluster(s.trim(), customMappings)).filter(Boolean);
            subjects.forEach(subject => {
                acc[subject] = (acc[subject] || 0) + 1;
            });
        } else {
            acc[rawVal] = (acc[rawVal] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
};


/**
 * Aggregates by Day of Week
 */
export const getEventsByDayOfWeek = (data) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = data.reduce((acc, curr) => {
        const d = curr.day;
        if (d && days.includes(d)) acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});

    return days.map(d => ({ name: d, value: counts[d] || 0 }));
};

/**
 * Groups events into exact concurrency points (30-min intervals)
 * Logic: Count classes active at the exact timestamp (start <= point <= end)
 */
export const getTimeSlotDistribution = (data) => {
    if (!data || data.length === 0) return [];

    // 1. Find the operational range (min/max hours)
    let minHour = 24;
    let maxHour = 0;
    let hasValidTime = false;

    data.forEach(item => {
        if (item.startTime && item.startTime.includes(':')) {
            const h = parseInt(item.startTime.split(':')[0]);
            if (!isNaN(h)) {
                minHour = Math.min(minHour, h);
                hasValidTime = true;
            }
        }
        if (item.endTime && item.endTime.includes(':')) {
            const h = parseInt(item.endTime.split(':')[0]);
            if (!isNaN(h)) {
                maxHour = Math.max(maxHour, h);
                hasValidTime = true;
            }
        }
    });

    if (!hasValidTime) return [];

    // Adjust range for better visibility (buffer hours)
    minHour = Math.max(0, minHour);
    maxHour = Math.min(23, maxHour + 1); // +1 to capture the end boundary

    // 2. Generate 30-minute points
    const points = [];
    for (let h = minHour; h <= maxHour; h++) {
        for (let m of [0, 30]) {
            if (h === maxHour && m === 30) break; // Don't go past the last hour

            const hour12 = h % 12 || 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const label = m === 0 ? `${hour12} ${ampm}` : `${hour12}:${m} ${ampm}`;

            points.push({
                totalMinutes: h * 60 + m,
                label,
                count: 0
            });
        }
    }

    // 3. Count concurrency at each point
    data.forEach(item => {
        if (!item.startTime || !item.startTime.includes(':') || !item.endTime || !item.endTime.includes(':')) return;

        const [sH, sM] = item.startTime.split(':').map(p => parseInt(p, 10));
        const [eH, eM] = item.endTime.split(':').map(p => parseInt(p, 10));

        if (isNaN(sH) || isNaN(eH)) return;

        const startTotal = sH * 60 + sM;
        const endTotal = eH * 60 + eM;

        points.forEach(point => {
            // Formula: count where start_time <= selected_time AND end_time > selected_time (exclusive end)
            if (startTotal <= point.totalMinutes && endTotal > point.totalMinutes) {
                point.count++;
            }
        });
    });

    return points.map(p => ({
        name: p.label,
        value: p.count,
        totalMinutes: p.totalMinutes,
        fullLabel: `Concurrency at ${p.label}`
    }));
};

/**
 * Specialized distribution for Exams
 * Falls back to slot-label grouping if exact times are missing
 */
export const getExamDistribution = (data) => {
    if (!data || data.length === 0) return [];

    // 1. Try time-based concurrency first (same as classes)
    const timeBased = getTimeSlotDistribution(data);
    if (timeBased.length > 0 && timeBased.some(p => p.value > 0)) {
        return timeBased;
    }

    // 2. Fallback: Group by the literal 'timeSlot' label (e.g. "Slot 1", "Morning", etc)
    const counts = data.reduce((acc, curr) => {
        const slot = curr.timeSlot || 'Unspecified';
        acc[slot] = (acc[slot] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([name, value]) => ({ 
            name, 
            value,
            fullLabel: `Exam Volume in ${name}`
        }))
        .sort((a, b) => b.value - a.value);
};

/**
 * Filters data for today
 */
export const getTodayEvents = (data) => {
    return data.filter(item => {
        try {
            return isToday(new Date(item.date));
        } catch (e) { return false; }
    }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
};

/**
 * Filters data for next 7 days (including today)
 */
export const getUpcomingEvents = (data) => {
    const today = startOfDay(new Date());
    const next7Days = endOfDay(addDays(today, 7));

    return data.filter(item => {
        try {
            const d = new Date(item.date);
            return isWithinInterval(d, { start: today, end: next7Days });
        } catch (e) { return false; }
    }).sort((a, b) => {
        const dateComp = compareAsc(new Date(a.date), new Date(b.date));
        if (dateComp !== 0) return dateComp;
        return (a.startTime || '').localeCompare(b.startTime || '');
    });
};

/**
 * Advanced Teacher Analytics
 * Splits teachers by "&" and calculates metrics
 */
export const getTeacherWorkload = (data) => {
    if (!data) return [];
    const teachers = {};

    data.forEach(item => {
        if (!item || !item.teacher) return;

        // Safety: ensure it's a string
        const teacherStr = typeof item.teacher === 'string' ? item.teacher : String(item.teacher);
        const names = teacherStr.split(/[,&]/).map(n => n.trim()).filter(Boolean);


        names.forEach(name => {
            if (!teachers[name]) {
                teachers[name] = {
                    name,
                    sessions: 0,
                    totalMinutes: 0,
                    batches: new Set(),
                    subjects: new Set(),
                };
            }

            teachers[name].sessions += 1;
            teachers[name].totalMinutes += (item.durationMinutes || 0);
            if (item.batchName) teachers[name].batches.add(item.batchName);
            if (item.subject) teachers[name].subjects.add(item.subject);

        });
    });

    return Object.values(teachers).map(t => ({
        ...t,
        batchCount: t.batches.size,
        subjectCount: t.subjects.size,
        totalHours: Math.round((t.totalMinutes / 60) * 10) / 10,
        avgDuration: t.sessions ? Math.round(t.totalMinutes / t.sessions) : 0
    })).sort((a, b) => b.sessions - a.sessions);
};

/**
 * Advanced Batch Analytics
 */
export const getBatchAnalytics = (data) => {
    if (!data) return [];
    const batches = {};

    data.forEach(item => {
        if (!item) return;
        const batchStr = item.batchName ? item.batchName.toString() : 'Unknown Batch';
        const batchNames = batchStr.split(/[,&]/).map(b => b.trim()).filter(Boolean);

        batchNames.forEach(name => {
            if (!batches[name]) {
                batches[name] = {
                    name,
                    sessions: 0,
                    classes: 0,
                    exams: 0,
                    totalMinutes: 0,
                    platforms: {},
                    dates: new Set(),
                };
            }

            batches[name].sessions += 1;
            if (item.eventCategory === 'Class') batches[name].classes += 1;
            if (item.eventCategory === 'Exam') batches[name].exams += 1;
            batches[name].totalMinutes += (item.durationMinutes || 0);
            batches[name].dates.add(item.date);

            if (item.platform) {
                batches[name].platforms[item.platform] = (batches[name].platforms[item.platform] || 0) + 1;
            }
        });
    });

    return Object.values(batches).map(b => ({
        ...b,
        avgDuration: b.sessions ? Math.round(b.totalMinutes / b.sessions) : 0,
        activeDays: b.dates.size,
        topPlatform: Object.entries(b.platforms).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    })).sort((a, b) => b.sessions - a.sessions);
};

/**
 * Advanced Time Intelligence Pattern
 */
export const getTimeIntelligence = (data) => {
    if (!data || !data.length) return {
        avgDailyLoad: 0,
        avgDuration: 0,
        longestSession: 0,
        shortestSession: 0,
        hourBands: Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, value: 0 })),
        durationDistribution: [
            { name: '< 30m', value: 0 },
            { name: '30-60m', value: 0 },
            { name: '60-90m', value: 0 },
            { name: '90-120m', value: 0 },
            { name: '> 120m', value: 0 },
        ]
    };

    const durations = data.map(d => d.durationMinutes || 0).filter(d => d > 0);
    const byDate = getEventsByDate(data);

    // Sessions per day avg
    const avgSessionsPerDay = byDate.length ? Math.round(data.length / byDate.length) : 0;

    // Duration stats
    const totalMinutes = durations.reduce((a, b) => a + b, 0);

    // Hour bands (0-23)
    const hourBands = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    data.forEach(item => {
        if (item.startTime && typeof item.startTime === 'string') {
            const h = parseInt(item.startTime.split(':')[0]);
            if (!isNaN(h) && h >= 0 && h < 24) hourBands[h].count += 1;
        }
    });

    return {
        avgDailyLoad: avgSessionsPerDay,
        avgDuration: durations.length ? Math.round(totalMinutes / durations.length) : 0,
        longestSession: durations.length ? Math.max(...durations) : 0,
        shortestSession: durations.length ? Math.min(...durations) : 0,
        hourBands: hourBands.map(h => ({ name: `${h.hour}:00`, value: h.count })),
        durationDistribution: [
            { name: '< 30m', value: durations.filter(d => d < 30).length },
            { name: '30-60m', value: durations.filter(d => d >= 30 && d <= 60).length },
            { name: '60-90m', value: durations.filter(d => d > 60 && d <= 90).length },
            { name: '90-120m', value: durations.filter(d => d > 90 && d <= 120).length },
            { name: '> 120m', value: durations.filter(d => d > 120).length },
        ]
    };
};

/**
 * Gets high level insights
 */
export const getQuickInsights = (data, customMappings = {}) => {
    if (!data || !data.length) return {
        busiestDate: 'N/A',
        busiestDay: 'N/A',
        mostActiveBatch: 'N/A',
        mostActiveTeacher: 'N/A'
    };

    const byDate = getEventsByDate(data);
    const byDay = getEventsByDayOfWeek(data);
    const teacherStats = getTeacherWorkload(data);
    const batchStats = getBatchAnalytics(data);
    const subjectStats = getTopStats(data, 'subject', 1, customMappings);
    const platformStats = getTopStats(data, 'platform', 1);
    const timeStats = getTimeIntelligence(data);

    return {
        busiestDate: byDate.length ? [...byDate].sort((a, b) => b.count - a.count)[0]?.date : 'N/A',
        busiestDay: byDay.length ? [...byDay].sort((a, b) => b.value - a.value)[0]?.name : 'N/A',
        mostActiveBatch: batchStats[0]?.name || 'N/A',
        mostActiveTeacher: teacherStats[0]?.name || 'N/A',
        mostActiveSubject: subjectStats[0]?.name || 'N/A',
        mostUsedPlatform: platformStats[0]?.name || 'N/A',
        avgDailyLoad: timeStats?.avgDailyLoad || 0
    };
};

/**
 * Calculates global peak concurrency across the entire dataset
 */
export const getPeakConcurrency = (data) => {
    if (!data || !data.length) return 0;
    
    // Group by date first to find daily peaks, then overall peak
    const byDate = {};
    data.forEach(item => {
        if (!byDate[item.date]) byDate[item.date] = [];
        byDate[item.date].push(item);
    });

    let maxOverall = 0;
    Object.values(byDate).forEach(dayData => {
        const distribution = getTimeSlotDistribution(dayData);
        const dayMax = distribution.length ? Math.max(...distribution.map(d => d.value)) : 0;
        if (dayMax > maxOverall) maxOverall = dayMax;
    });

    return maxOverall;
};

/**
 * Calculates total program hours
 */
export const getTotalHours = (data) => {
    if (!data || !data.length) return 0;
    const totalMinutes = data.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
};
