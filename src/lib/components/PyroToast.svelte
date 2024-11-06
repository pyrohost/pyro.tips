<script lang="ts">
	import { blur } from '$lib/transitions';
	import { XIcon } from 'lucide-svelte';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	let {
		message,
		title,
		duration = 2000,
		shown = $bindable(false),
		type = 'success',
		position = 'bottom'
	} = $props();

	type ToastType = 'success' | 'error' | 'warning' | 'info';
	let toastType: ToastType = type as ToastType;

	type Position = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
	let toastPos: Position = position as Position;

	// Icon mapping based on type
	const icons = {
		success: {
			color: 'text-green-500',
			path: 'M5 13l4 4L19 7'
		},
		error: {
			color: 'text-red-500',
			path: 'M6 18L18 6M6 6l12 12'
		},
		warning: {
			color: 'text-yellow-500',
			path: 'M12 8v4m0 4h.01M4.293 6.293a1 1 0 011.414 0L12 12l6.293-5.707a1 1 0 011.414 1.414L13.414 13l6.293 5.707a1 1 0 01-1.414 1.414L12 14l-6.293 5.707a1 1 0 01-1.414-1.414L10.586 13 4.293 7.707a1 1 0 010-1.414z'
		},
		info: {
			color: 'text-blue-500',
			path: 'M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z'
		}
	};

	// Position classes based on the position prop
	const positionClasses = {
		top: 'top-4 left-1/2 transform -translate-x-1/2',
		'top-left': 'top-4 left-4',
		'top-right': 'top-4 right-4',
		bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
		'bottom-left': 'bottom-4 left-4',
		'bottom-right': 'bottom-4 right-4'
	};

	// Automatically hide the toast after the duration
	$effect(() => {
		if (shown) {
			setTimeout(() => {
				shown = false;
			}, duration);
		}
	});
</script>

{#if shown}
	<div
		class="fixed z-50 flex w-full max-w-sm space-x-4 bg-zinc-900 p-4 shadow-lg {positionClasses[
			toastPos
		]}"
		in:blur={{
			duration: 500,
			blurMultiplier: 10,
			easing: quintOut,
			y: {
				start: -25,
				end: 0
			}
		}}
		out:blur={{
			duration: 500,
			blurMultiplier: 10,
			easing: quintOut,
			scale: {
				start: 1,
				end: 0.9
			},
			y: {
				start: 0,
				end: 25
			}
		}}
	>
		<XIcon class="h-6 w-6 {icons[toastType].color} mt-1 flex-shrink-0" />

		<div>
			<h3 class="text-lg font-semibold {icons[toastType].color} flex-grow">{title}</h3>
			<p>{message}</p>
		</div>
	</div>
{/if}
