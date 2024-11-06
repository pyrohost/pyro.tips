<script lang="ts">
	import CompletableSpinner from '$lib/components/CompletableSpinner.svelte';

	let done = $state(false);
	let invert = $state(false);
	let size = $state(32);
	let thickness = $state(4);
</script>

<div class="fixed left-0 top-0 flex h-screen w-screen flex-col items-center justify-center gap-4">
	<div class="btn {invert ? 'primary' : ''}">
		<CompletableSpinner {size} {thickness} {done} {invert} />
	</div>
	<div class="flex gap-4">
		<button class="btn" onclick={() => (done = !done)}>Toggle Done</button>
		<button class="btn" onclick={() => (invert = !invert)}>Toggle Invert</button>
	</div>
	<div class="flex gap-4">
		<input type="range" min={0} max={100} step={0.01} bind:value={size} />
		<input type="range" min={0} max={size / 2} step={0.01} bind:value={thickness} />
	</div>
</div>
