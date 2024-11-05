<script lang="ts">
	import PyroLogo from '$lib/components/PyroLogo.svelte';
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
		class="fixed z-50 flex w-full max-w-sm items-center space-x-4 rounded-lg bg-zinc-900 p-4 shadow-lg {positionClasses[
			toastPos
		]}"
		transition:fly={{ y: '100%', duration: 300 }}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 {icons[toastType].color}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d={icons[toastType].path}
			/>
		</svg>

		<div>
			<h3 class="font-semibold">{title}</h3>
			<p>{message}</p>
		</div>
	</div>
{/if}

<div class="mx-auto flex h-screen w-full max-w-lg flex-col items-center justify-center">
	<PyroLogo style="mx-auto mb-6 h-16 w-16" />
	<h1 class="mb-4 text-center text-3xl font-semibold text-white">pyro.food</h1>
	<p class="mb-6 w-full text-center text-gray-200">
		pyro.food allows you to treat any Pyro employee to a meal. It's simple — you find the meal
		price, write out what the meal is and send it, and they'll be instantly notified about it!
	</p>
	<a href="/order" class="btn primary w-full">Order Now</a>
</div>
