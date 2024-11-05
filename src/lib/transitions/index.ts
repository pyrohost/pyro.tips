import type { EasingFunction, TransitionConfig } from 'svelte/transition';

const remap = (value: number, low1: number, high1: number, low2: number, high2: number) =>
	low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);

export const blur = (
	_: HTMLElement,
	config:
		| Partial<{
				blurMultiplier: number;
				duration: number;
				easing: EasingFunction;
				scale: {
					start: number;
					end: number;
				};
				x: {
					start: number;
					end: number;
				};
				y: {
					start: number;
					end: number;
				};
		  }>
		| undefined,
	dir: {
		direction: 'in' | 'out' | 'both';
	}
): TransitionConfig => {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	return {
		duration: prefersReducedMotion ? 0 : config?.duration || 300,
		css: (t) =>
			prefersReducedMotion
				? ''
				: `filter: blur(${(1 - t) * (config?.blurMultiplier || 1)}px); opacity: ${t}; transform: scale(${remap(
						t,
						0,
						1,
						(dir.direction !== 'out' ? config?.scale?.start : config?.scale?.end) || 0.9,
						(dir.direction !== 'out' ? config?.scale?.end : config?.scale?.start) || 1
					)}) translate(${remap(
						t,
						0,
						1,
						(dir.direction !== 'out' ? config?.x?.start : config?.x?.end) || 0,
						(dir.direction !== 'out' ? config?.x?.end : config?.x?.start) || 0
					)}px, ${remap(
						t,
						0,
						1,
						(dir.direction !== 'out' ? config?.y?.start : config?.y?.end) || 0,
						(dir.direction !== 'out' ? config?.y?.end : config?.y?.start) || 0
					)}px);`,
		easing: config?.easing
	};
};
