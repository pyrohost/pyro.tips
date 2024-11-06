<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { blur } from '$lib/transitions';
	import { Check } from 'lucide-svelte';
	import { quintOut } from 'svelte/easing';

	type Props = {
		size?: number;
		thickness?: number;
		done?: boolean;
		invert?: boolean;
	};

	const { size = 32, thickness = 4, done = false, invert = false }: Props = $props();
</script>

<div class="relative" style="width: {size}px; height: {size}px;">
	{#if !done}
		<div
			transition:blur={{
				blurMultiplier: 6,
				duration: 800,
				easing: quintOut,
				scale: {
					start: 0.75,
					end: 1
				}
			}}
			class="absolute h-full w-full"
		>
			<Spinner {invert} {thickness} />
		</div>
	{/if}
	{#if done}
		<div
			transition:blur={{
				blurMultiplier: 6,
				duration: 500,
				easing: quintOut,
				scale: {
					start: 0.75,
					end: 1
				}
			}}
			class="absolute h-full w-full overflow-hidden rounded-full {invert ? 'bg-black' : 'bg-white'}"
		>
			<div
				transition:blur={{
					duration: 600,
					delay: 75,
					blurMultiplier: 2,
					easing: quintOut,
					scale: {
						start: 0.5,
						end: 1
					}
				}}
				class="absolute flex h-full w-full items-center justify-center"
				style="padding: {size * 0.15}px;"
			>
				<Check
					strokeWidth={3}
					class="h-full w-full font-bold {invert ? 'text-white' : 'text-black'}"
				/>
			</div>
		</div>
	{/if}
</div>
