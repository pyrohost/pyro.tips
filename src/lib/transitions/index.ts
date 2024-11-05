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
		  }>
		| undefined
): TransitionConfig => {
	return {
		duration: config?.duration || 300,
		css: (t) =>
			`filter: blur(${(1 - t) * (config?.blurMultiplier || 1)}px); opacity: ${t}; transform: scale(${remap(
				t,
				0,
				1,
				0.95,
				1
			)};`,
		easing: config?.easing
	};
};
