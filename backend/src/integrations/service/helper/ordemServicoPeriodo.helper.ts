export function formatDateYmd(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getMostRecentThursday(referenceDate = new Date()): Date {
    const result = new Date(referenceDate);
    result.setHours(0, 0, 0, 0);
    const dayOfWeek = result.getDay();
    const daysSinceThursday = (dayOfWeek - 4 + 7) % 7;
    result.setDate(result.getDate() - daysSinceThursday);
    return result;
}