import { format, parseISO, isValid } from 'date-fns';
import localforage from 'localforage';const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyooi5zLMe9s4eXtWgxNPwMM36I99-36q6GROzI-FKi23ULkQaXEAlP4i9QnkKY8WxlFA/exec';
const CACHE_KEY = 'shikho_schedule_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

const CLASS_TYPES = new Set([
    'Lecture Class',
    'Special Live',
    'Pre - Recorded',
    'Pre-Recorded',
    'Orientation',
    'Solving Class',
    'Guideline Session',
    'Guardian Seminar',
    'Class'
]);

const EXAM_TYPES = new Set([
    'Exam',
    'Live MCQ',
    'Model Test',
    'Practice Test',
    'Daily MCQ',
    'Weekly Exam'
]);

/**
 * Normalizes time strings to HH:mm with high performance
 */
const normalizeTime = (timeStr) => {
    if (!timeStr) return '';
    const trimmed = timeStr.toString().trim();
    if (!trimmed || trimmed === 'N/A' || trimmed === '0') return '';

    // Handle ISO date-time strings from Google Sheets (e.g., 1899-12-30T12:06:40.000Z)
    if (trimmed.includes('T') && (trimmed.includes('1899') || trimmed.includes('1900'))) {
        try {
            const timeMatch = trimmed.match(/T(\d{2}):(\d{2})/);
            if (timeMatch) {
                let h = parseInt(timeMatch[1], 10);
                let m = parseInt(timeMatch[2], 10);

                // 1. Modern Dhaka offset fix (+6h)
                h = (h + 6) % 24;

                // 2. Strict LMT Adjustment:
                // Google Sheets representation of 1899 times for Dhaka includes a +06:06:40 offset.
                // This means "9:00 AM" becomes "03:00" UTC, but interpretations often result in "9:06".
                // We subtract exactly 6 minutes to return to the base program time.
                let totalMin = h * 60 + m - 6;
                if (totalMin < 0) totalMin += 1440; // Handle midnight wrap

                const finalH = Math.floor(totalMin / 60) % 24;
                const finalM = totalMin % 60;

                return `${finalH.toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`;
            }
        } catch (e) { }
    }

    // Standard date parsing for modern ISO strings
    if (trimmed.includes('T') && trimmed.includes('-')) {
        try {
            const d = new Date(trimmed);
            if (isValid(d)) {
                const roundedMs = Math.round(d.getTime() / 60000) * 60000;
                return format(new Date(roundedMs), 'HH:mm');
            }
        } catch (e) { }
    }

    // Fast path for HH:mm format
    if (trimmed.length === 5 && trimmed.includes(':')) return trimmed;

    try {
        // Relaxed regex: handle times like "9:00", "09:00", "10 AM", "10:30PM" even inside strings
        const match = trimmed.match(/(\d{1,2})(?:[:](\d{2})|[:.\s]*(\d{2})?\s*(AM|PM))/i);
        if (match) {
            let hrs = parseInt(match[1], 10);
            let mins = parseInt(match[2] || match[3] || '0', 10);
            const meridian = (match[4] || '').toUpperCase();

            if (mins >= 60) mins = 0;
            if (meridian === 'PM' && hrs < 12) hrs += 12;
            if (meridian === 'AM' && hrs === 12) hrs = 0;
            if (hrs >= 24) hrs = hrs % 24;

            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
    } catch (e) { }
    return trimmed;
};

/**
 * Normalizes dates to YYYY-MM-DD with memoization-like cache check
 */
const dateCache = new Map();
const normalizeDate = (dateVal) => {
    if (!dateVal) return '';
    const str = dateVal.toString().trim();
    if (dateCache.has(str)) return dateCache.get(str);

    try {
        let d = new Date(str);
        let result = str;

        if (isValid(d)) {
            result = format(d, 'yyyy-MM-dd');
        } else {
            const parts = str.split(/[/.-]/);
            if (parts.length === 3) {
                let day = parseInt(parts[0], 10);
                let month = parseInt(parts[1], 10);
                let year = parseInt(parts[2], 10);
                if (year < 100) year += 2000;
                const testDate = new Date(year, month - 1, day);
                if (isValid(testDate)) result = format(testDate, 'yyyy-MM-dd');
            }
        }

        dateCache.set(str, result);
        return result;
    } catch (e) {
        return str;
    }
};

const calculateDuration = (start, end) => {
    if (!start || !end || start.length < 5 || end.length < 5) return 0;
    try {
        const sH = parseInt(start.substring(0, 2), 10);
        const sM = parseInt(start.substring(3, 5), 10);
        const eH = parseInt(end.substring(0, 2), 10);
        const eM = parseInt(end.substring(3, 5), 10);

        const startTotal = sH * 60 + sM;
        const endTotal = eH * 60 + eM;
        let diff = endTotal - startTotal;
        if (diff < 0) diff += 1440;
        return diff;
    } catch (e) {
        return 0;
    }
};

export const getCachedScheduleData = async () => {
    try {
        const cached = await localforage.getItem(CACHE_KEY);
        if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
            return cached.data;
        }
    } catch (e) {
        console.warn('Error reading cache:', e);
    }
    return null;
};

export const fetchScheduleData = async (forceRefresh = false) => {
    // Check Cache first
    if (!forceRefresh) {
        try {
            const cached = await localforage.getItem(CACHE_KEY);
            if (cached) {
                if (Date.now() - cached.timestamp < CACHE_TTL) {
                    console.log('Serving from cache (Faster Load)');
                    return cached.data;
                }
            }
        } catch (e) {
            console.warn('Error reading cache during fetch:', e);
        }
    }

    try {
        console.log('Fetching live data from source...');
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format');

        const rows = data.slice(1);
        const transformedData = rows
            .filter(row => row && row[0])
            .map((row, index) => {
                const type = (row[9] || '').toString().trim();
                const platform = (row[10] || '').toString().trim();
                let start = normalizeTime(row[12]);
                let end = normalizeTime(row[13]);
                const date = normalizeDate(row[0]);
                const timeSlot = (row[2] || '').toString().trim();

                let day = (row[1] || '').toString().trim();
                if (!day || day.includes('T')) {
                    const d = parseISO(date);
                    if (isValid(d)) day = format(d, 'EEEE');
                }

                let eventCategory = 'Other';
                if (EXAM_TYPES.has(type) || EXAM_TYPES.has(platform)) eventCategory = 'Exam';
                else if (CLASS_TYPES.has(type)) eventCategory = 'Class';

                // For Exams, if start/end are missing, try parsing timeSlot
                if (eventCategory === 'Exam' && (!start || !end) && timeSlot.includes('-')) {
                    const parts = timeSlot.split('-').map(p => p.trim());
                    if (parts.length >= 2) {
                        if (!start) start = normalizeTime(parts[0]);
                        if (!end) end = normalizeTime(parts[1]);
                    }
                }

                return {
                    id: `row-${index}`,
                    date,
                    day,
                    timeSlot,
                    subject: (row[3] || '').toString().trim(),
                    topic: (row[4] || '').toString().trim(),
                    teacher: (row[5] || '').toString().trim(),
                    batchName: (row[6] || '').toString().trim(),
                    type,
                    platform: (row[10] || '').toString().trim(),
                    startTime: start,
                    endTime: end,
                    eventCategory,
                    durationMinutes: calculateDuration(start, end)
                };
            });

        // Store in Cache
        try {
            await localforage.setItem(CACHE_KEY, {
                data: transformedData,
                timestamp: Date.now()
            });
        } catch (storageError) {
            console.warn('Error saving to cache:', storageError);
        }

        return transformedData;
    } catch (error) {
        console.error('Fetch error:', error);
        // Fallback to cache if network fails
        try {
            const cached = await localforage.getItem(CACHE_KEY);
            if (cached && cached.data) return cached.data;
        } catch (e) {}
        throw error;
    }
};

