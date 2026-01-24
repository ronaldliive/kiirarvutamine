/**
 * Converts a number (0-99) to its Estonian word representation.
 * Used for hint functionality in the game.
 * 
 * @param num - Number to convert (0-99)
 * @returns Estonian word representation of the number
 * @example
 * numberToWords(5) // returns "viis"
 * numberToWords(23) // returns "kakskümmend kolm"
 */
export const numberToWords = (num: number): string => {
    const ones = ['null', 'üks', 'kaks', 'kolm', 'neli', 'viis', 'kuus', 'seitse', 'kaheksa', 'üheksa', 'kümme'];
    const teens = ['üksteist', 'kaksteist', 'kolmteist', 'neliteist', 'viisteist', 'kuusteist', 'seitseteist', 'kaheksateist', 'üheksateist'];
    const tens = ['', '', 'kakskümmend', 'kolmkümmend', 'nelikümmend', 'viiskümmend', 'kuuskümmend', 'seitsekümmend', 'kaheksakümmend', 'üheksakümmend'];

    if (num <= 10) return ones[num];
    if (num < 20) return teens[num - 11];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        if (one === 0) return tens[ten];
        return `${tens[ten]} ${ones[one]}`;
    }
    return num.toString();
};

/**
 * Formats an ISO date string to Estonian locale format.
 * 
 * @param isoString - ISO date string
 * @returns Formatted date string (DD.MM.YY HH:MM)
 */
export const formatDate = (isoString: string): string => {
    try {
        return new Date(isoString).toLocaleString('et-EE', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return isoString;
    }
};

/**
 * Formats seconds into MM:SS format
 * @param seconds 
 * @returns Formatted time string
 */
export const formatTimeSeconds = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};
