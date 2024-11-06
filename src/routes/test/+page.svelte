<script>
	import Spinner from '$lib/components/Spinner.svelte';
	import { blur } from '$lib/transitions';
	import { quintOut } from 'svelte/easing';

	let done = $state(false);
</script>

<div class="fixed left-0 top-0 flex h-screen w-screen flex-col items-center justify-center gap-8">
	<div class="relative h-8 w-8">
		<div class="absolute h-full w-full">
			<Spinner thickness={4} />
		</div>
		{#if done}
			<div
				transition:blur={{
					blurMultiplier: 0,
					duration: 500,
					easing: quintOut,
					scale: {
						start: 0,
						end: 1
					},
					opacity: false
				}}
				class="absolute h-full w-full rounded-full bg-white"
			></div>
		{/if}
	</div>
	<button onclick={() => (done = !done)} class="btn primary"
		>{done ? 'Complete' : 'Uncomplete'}</button
	>
</div>
