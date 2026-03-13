/**
 * Utility for detecting schedule conflicts
 */

const timeToMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const isOverlapping = (s1, s2) => {
    const start1 = timeToMinutes(s1.startTime);
    const end1 = timeToMinutes(s1.endTime);
    const start2 = timeToMinutes(s2.startTime);
    const end2 = timeToMinutes(s2.endTime);

    if (start1 < 0 || end1 < 0 || start2 < 0 || end2 < 0) return false;

    // Standard overlap check: one starts before the other ends, and vice versa
    return start1 < end2 && start2 < end1;
};

export const getScheduleConflicts = (data) => {
    if (!data || !data.length) return {
        all: [],
        teacherConflicts: [],
        batchConflicts: [],
        total: 0,
        teacherCount: 0,
        batchCount: 0,
        mostConflictProneTeacher: 'N/A',
        mostConflictProneBatch: 'N/A'
    };

    const conflicts = [];
    const teacherConflictIds = new Set();
    const batchConflictIds = new Set();

    // Grouping stats
    const teacherConflictFrequency = {};
    const batchConflictFrequency = {};

    // Group by date first to reduce search space
    const dateGroups = data.reduce((acc, item) => {
        if (!item.date) return acc;
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    Object.entries(dateGroups).forEach(([date, dayItems]) => {
        // 1. Batch Conflicts
        const batchGroups = dayItems.reduce((acc, item) => {
            if (!item.batchName) return acc;
            if (!acc[item.batchName]) acc[item.batchName] = [];
            acc[item.batchName].push(item);
            return acc;
        }, {});

        Object.entries(batchGroups).forEach(([batchName, sessions]) => {
            if (sessions.length < 2) return;
            for (let i = 0; i < sessions.length; i++) {
                for (let j = i + 1; j < sessions.length; j++) {
                    if (isOverlapping(sessions[i], sessions[j])) {
                        const conflict = {
                            type: 'Batch Conflict',
                            involved: batchName,
                            date,
                            session1: sessions[i],
                            session2: sessions[j]
                        };
                        conflicts.push(conflict);
                        batchConflictIds.add(`${sessions[i].id}-${sessions[j].id}`);
                        batchConflictFrequency[batchName] = (batchConflictFrequency[batchName] || 0) + 1;
                    }
                }
            }
        });

        // 2. Teacher Conflicts
        // First, explode sessions by teacher (since one session can have multiple teachers)
        const teacherMap = {};
        dayItems.forEach(item => {
            if (!item.teacher) return;
            const names = item.teacher.split('&').map(n => n.trim()).filter(Boolean);
            names.forEach(name => {
                if (!teacherMap[name]) teacherMap[name] = [];
                teacherMap[name].push(item);
            });
        });

        Object.entries(teacherMap).forEach(([teacherName, sessions]) => {
            if (sessions.length < 2) return;
            for (let i = 0; i < sessions.length; i++) {
                for (let j = i + 1; j < sessions.length; j++) {
                    if (isOverlapping(sessions[i], sessions[j])) {
                        const conflict = {
                            type: 'Teacher Conflict',
                            involved: teacherName,
                            date,
                            session1: sessions[i],
                            session2: sessions[j]
                        };
                        conflicts.push(conflict);
                        teacherConflictIds.add(`${sessions[i].id}-${sessions[j].id}`);
                        teacherConflictFrequency[teacherName] = (teacherConflictFrequency[teacherName] || 0) + 1;
                    }
                }
            }
        });
    });

    const teacherConflictsList = conflicts.filter(c => c.type === 'Teacher Conflict');
    const batchConflictsList = conflicts.filter(c => c.type === 'Batch Conflict');

    const getTop = (freq) => {
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        return sorted.length ? sorted[0][0] : 'N/A';
    };

    return {
        all: conflicts,
        teacherConflicts: teacherConflictsList,
        batchConflicts: batchConflictsList,
        total: conflicts.length,
        teacherCount: teacherConflictsList.length,
        batchCount: batchConflictsList.length,
        mostConflictProneTeacher: getTop(teacherConflictFrequency),
        mostConflictProneBatch: getTop(batchConflictFrequency)
    };
};

/**
 * Groups events by date for timeline view
 */
export const getTimelineData = (data) => {
    if (!data || !data.length) return [];

    const groups = data.reduce((acc, item) => {
        if (!item.date) return acc;
        if (!acc[item.date]) {
            acc[item.date] = {
                date: item.date,
                day: item.day,
                events: []
            };
        }
        acc[item.date].events.push(item);
        return acc;
    }, {});

    return Object.values(groups)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(group => ({
            ...group,
            events: group.events.sort((a, b) => {
                const aTime = timeToMinutes(a.startTime);
                const bTime = timeToMinutes(b.startTime);
                return aTime - bTime;
            }),
            stats: {
                total: group.events.length,
                classes: group.events.filter(e => e.eventCategory === 'Class').length,
                exams: group.events.filter(e => e.eventCategory === 'Exam').length,
                topBatches: [...new Set(group.events.map(e => e.batchName))].slice(0, 3)
            }
        }));
};
