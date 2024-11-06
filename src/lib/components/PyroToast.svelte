<script lang="ts">
	import { blur } from '$lib/transitions';
	import { toastsStore } from '$lib/util';
	import { XIcon } from 'lucide-svelte';
	import { quintOut } from 'svelte/easing';

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
</script>

<div class="flex flex-col gap-4">
	{#each toastsStore.toasts as toast}
		<div
			class="z-50 flex w-full max-w-sm space-x-4 bg-zinc-900 p-4 shadow-lg"
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
			<XIcon class="h-6 w-6 {icons[toast.type].color} mt-1 flex-shrink-0" />

			<div>
				<h3 class="text-lg font-semibold {icons[toast.type].color} flex-grow">{toast.title}</h3>
				<p>{toast.message}</p>
			</div>
		</div>
	{/each}
</div>
