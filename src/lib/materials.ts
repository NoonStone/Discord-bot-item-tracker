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
