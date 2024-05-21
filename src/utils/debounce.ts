/**
 * Debounces a method by a certain amount of time in ms
 */
export function debounce<T extends (...args: unknown[]) => void>(cb: T, wait = 25) {
	let h: ReturnType<typeof setTimeout>;

	const callable = (...args: Parameters<T>) => {
		clearTimeout(h);
		h = setTimeout(() => cb(...args), wait);
	};

	return callable;
}
