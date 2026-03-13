
/**
 * Clusters similar subjects into a single base subject name.
 * Now supports splitting composite subjects with "+" (e.g., "Bangla + Biology")
 * Returns an ARRAY of clustered subject names.
 */
export function getSubjectCluster(subjectName = "", customMappings = {}) {
    if (!subjectName) return ["Other"];

    const s = subjectName.trim();

    // 1. Check if the entire string has a custom mapping first
    // If it does, we also allow the override to be a composite (e.g., "Math + Science")
    if (customMappings[s]) {
        return customMappings[s].split('+').map(p => p.trim()).filter(Boolean);
    }

    // 2. Handle splitting by "+" for multi-subject entries
    const parts = s.split('+').map(p => p.trim()).filter(Boolean);

    const results = parts.map(part => {
        const lower = part.toLowerCase();

        // Check custom mapping for the individual part
        if (customMappings[part]) {
            // Even individual parts can be mapped to multiple subjects via "+" in the mapping value
            return customMappings[part].split('+').map(p => p.trim()).filter(Boolean);
        }

        // 3. Default mapping rules
        if (lower.includes('bangla') || lower.includes('bengali')) return 'Bangla';
        if (lower.includes('english')) return 'English';
        if (lower.includes('math')) return 'Math';
        if (lower.includes('physics')) return 'Physics';
        if (lower.includes('chemistry')) return 'Chemistry';
        if (lower.includes('biology')) return 'Biology';
        if (/\bict\b/i.test(lower)) return 'ICT';
        if (lower.includes('bgs') || lower.includes('bangaldesh and global') || lower.includes('global studies')) return 'BGS';
        if (lower.includes('religion') || lower.includes('islam') || lower.includes('hindu') || lower.includes('buddhist') || lower.includes('christian')) return 'Religion';
        if (lower.includes('agriculture')) return 'Agriculture';
        if (lower.includes('quarter final')) return 'Quarter Final Exam';
        if (lower.includes('accounting')) return 'Accounting';
        if (lower.includes('finance')) return 'Finance';
        if (lower.includes('management')) return 'Management';
        if (lower.includes('business')) return 'Business Studies';
        if (lower.includes('economics')) return 'Economics';
        if (lower.includes('geography')) return 'Geography';
        if (lower.includes('civics')) return 'Civics';
        if (lower.includes('history')) return 'History';
        if (lower.includes('sociology')) return 'Sociology';
        if (lower.includes('social science')) return 'Social Science';
        if (lower.includes('psychology')) return 'Psychology';
        if (lower.includes('logic')) return 'Logic';
        if (lower.includes('science')) return 'Science';

        // Default: If no rule matches, return the part as its own cluster
        return part;
    });

    // Flatten results in case a mapping for a part returned an array
    const flattened = results.flat();

    // Return unique clusters for this entry
    return [...new Set(flattened)];
}

/**
 * Returns unique clustered subjects from a list of raw subject strings.
 */
export function getClusteredSubjects(subjects, customMappings = {}) {
    if (!subjects || !Array.isArray(subjects)) return [];
    const allClusters = subjects.flatMap(s => getSubjectCluster(s, customMappings));
    return [...new Set(allClusters)].sort();
}
