/**
 * Generates CSV export content from a game session.
 * Uses semicolon separators and UTF-8 BOM for Excel compatibility.
 * 
 * @param {Object} session - Session object with questions, date, difficulty, etc.
 * @returns {string} CSV content with BOM prefix
 */
export const generateCSV = (session) => {
    // 1. Metadata Section
    const dateStr = new Date(session.date).toLocaleString('et-EE');
    const mistakes = session.questions.filter(q => q.attempts.length > 0).length;
    const totalSec = session.totalTime;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const timeStr = `${m}m ${s}s`;

    const metadata = [
        ['Kiirarvutamine', `${session.difficulty}-piires`],
        ['Kuupäev', dateStr],
        ['Tulemus', `${session.questions.length} vastatud`],
        ['Aeg', timeStr],
        ['Vigu', mistakes],
        [] // Empty row
    ].map(row => row.join(';')).join('\n');

    // 2. Data Table
    const headers = ['Tehe;Vastus;Aeg (s);Vead (pakkumised);Üle aja'];
    const rows = session.questions.map(q => {
        // Format attempts nicely: "4, 9" (comma separated inside the field)
        const attemptsStr = q.attempts ? q.attempts.map(a => a.value).join(', ') : '';
        // Boolean to Est
        const isOvertimeStr = q.isOvertime ? 'Jah' : '';

        // Use semicolon separator for columns
        return `${q.question};${q.answer};${q.time.toFixed(1).replace('.', ',')};"${attemptsStr}";${isOvertimeStr}`;
    });

    // Combine with BOM for Excel UTF-8 compatibility
    return '\uFEFF' + metadata + '\n' + headers + '\n' + rows.join('\n');
};

export const downloadCSV = (session) => {
    const csvContent = generateCSV(session);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kiirarvutamine_${session.date.slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateClipboardText = (session) => {
    const dateStr = new Date(session.date).toLocaleString('et-EE');
    const mistakes = session.questions.filter(q => q.attempts.length > 0).length;
    // Format:
    // Kiirarvutamine 20-piires
    // 18.01.2026 12:30
    // Tulemus: 48/48
    // Aeg: 2m 30s
    // Vead: 3

    const totalSec = session.totalTime;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const timeStr = `${m}m ${s}s`;

    // Use session.questionCount or fallback to session.questions.length if completed
    const totalQs = session.questions.length; // Simplified for clipboard

    return `Kiirarvutamine ${session.difficulty}-piires\n${dateStr}\nTulemus: ${session.questions.length}/${totalQs}\nAeg: ${timeStr}\nVead: ${mistakes}`;
};

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};
