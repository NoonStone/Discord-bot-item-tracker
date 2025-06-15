export function getMaterialList(): string[] {
	return [
		'diamond',
		'gold',
		'iron',
		'coal',
		'lapis',
		'redstone',
		'emeralds',
		'copper',
		'sets',
		'helmet',
		'chestplate',
		'leggings',
		'boots',
		'swords',
		'xp'
	];
}

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function isValidDateString(dateStr: string | null): boolean {
	// Check format: YYYY-MM-DD
	if (dateStr == null) return false;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

	// Parse and check if valid date
	const date = new Date(dateStr);
	return !isNaN(date.getTime()) && date.toISOString().startsWith(dateStr);
}

export function getSetPieces(): string[] {
	return [
		'helmet',
		'chestplate',
		'leggings',
		'boots',
	];
}
