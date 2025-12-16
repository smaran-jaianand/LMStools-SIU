/**
 * Helper functions for handling student data display
 */

/**
 * Extracts display information (Roll Number, Name) from a student object.
 * Attempts to intelligently identify columns based on common naming conventions.
 * Falls back to positional indices if keys don't match.
 * 
 * @param {Object} student - The student data object (key-value pairs from Excel)
 * @returns {Object} - { rollNumber, name }
 */
export const getStudentDisplayInfo = (student) => {
    if (!student || typeof student !== 'object') {
        return { rollNumber: '-', name: '-' };
    }

    const keys = Object.keys(student);
    if (keys.length === 0) {
        return { rollNumber: '-', name: '-' };
    }

    // Convert keys to lower case for case-insensitive matching
    const lowerKeys = keys.map(k => k.toLowerCase().trim());

    // 1. Identify Roll Number
    // Common variations: "roll", "prn", "id", "usn", "register", "reg"
    let rollKeyIndex = lowerKeys.findIndex(k =>
        k.includes('roll') ||
        k.includes('prn') ||
        k.includes('usn') ||
        k.includes('reg') ||
        k === 'id'
    );

    // 2. Identify Name
    // Common variations: "name", "student"
    let nameKeyIndex = lowerKeys.findIndex(k =>
        k.includes('name') ||
        k.includes('student')
    );

    // Fallback Logic
    // If we found a name but no roll number, and name is at index 0, roll might be at index 1?
    // Usually Roll is first, Name is second.

    // Explicit Fallback:
    // If Roll Number is not found, assume it is the first column.
    if (rollKeyIndex === -1) {
        rollKeyIndex = 0;
    }

    // If Name is not found, assume it is the second column.
    // If the second column happens to be the same as the roll number (e.g. only 1 column), take the first one or leave empty.
    if (nameKeyIndex === -1) {
        nameKeyIndex = keys.length > 1 ? 1 : 0;
        // If we only have 1 column and we forced rollKeyIndex=0, this makes name same as roll. 
        // That's acceptable for 1-column data.
    }

    // EDGE CASE: If both matched the same column (e.g. "Student Name" maps to Name, but also contains "Student" so maybe mistakenly thought as something else? No, logic above splits them).
    // But if we used fallbacks, ensure they aren't same unless necessary.
    if (rollKeyIndex === nameKeyIndex && keys.length > 1) {
        // If both point to 0, and we have more data, likely 0 is Roll, 1 is Name
        nameKeyIndex = 1;
    }

    return {
        rollNumber: student[keys[rollKeyIndex]],
        name: student[keys[nameKeyIndex]]
    };
};
