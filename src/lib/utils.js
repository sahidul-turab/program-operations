import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatTime(timeStr) {
    if (!timeStr) return "N/A"
    // If it's already a clean HH:mm pattern
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr)) return timeStr

    // Try to parse common patterns like "10:30 AM" or "14:00"
    try {
        const [time, modifier] = timeStr.split(" ")
        let [hours, minutes] = time.split(":")

        if (hours === '12') {
            hours = '00'
        }

        if (modifier && modifier.toUpperCase() === 'PM') {
            hours = parseInt(hours, 10) + 12
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (e) {
        return timeStr
    }
}

export function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return null
    try {
        const s = startTime.split(':')
        const e = endTime.split(':')
        const startMins = parseInt(s[0]) * 60 + parseInt(s[1])
        const endMins = parseInt(e[0]) * 60 + parseInt(e[1])
        let diff = endMins - startMins
        if (diff < 0) diff += 24 * 60 // Handle overnight
        return diff
    } catch (e) {
        return null
    }
}
