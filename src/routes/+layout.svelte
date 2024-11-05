<script lang="ts">
	import { blur } from '$lib/transitions';
	import { quintOut } from 'svelte/easing';
	import '../app.css';
	let { children, data } = $props();
</script>

<div class="grid grid-cols-1 grid-rows-1">
	{#key data.pathname}
		<div
			transition:blur={{
				duration: 500,
				easing: quintOut,
				blurMultiplier: 3
			}}
			class="col-start-1 row-start-1"
		>
			{@render children()}
		</div>
	{/key}
</div>
