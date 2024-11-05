<script lang="ts">
	import { blur } from '$lib/transitions';
	import { quintOut } from 'svelte/easing';
	import '../app.css';
	import { beforeNavigate } from '$app/navigation';
	let { children, data } = $props();

	let isForwardNav = $state(true);

	beforeNavigate(({ from, to }) => {
		if (to && from) {
			isForwardNav = to.url.pathname.length > from.url.pathname.length;
			console.log(isForwardNav);
		}
	});
</script>

<div class="grid grid-cols-1 grid-rows-1">
	{#key data.pathname}
		<div
			in:blur={{
				duration: 500,
				easing: quintOut,
				blurMultiplier: 3,
				x: {
					start: isForwardNav ? 100 : -100,
					end: 0
				},
				scale: {
					start: 0.9,
					end: 1
				}
			}}
			out:blur={{
				duration: 500,
				easing: quintOut,
				blurMultiplier: 3,
				x: {
					start: 0,
					end: isForwardNav ? -100 : 100
				},
				scale: {
					start: 1,
					end: 0.9
				}
			}}
			class="col-start-1 row-start-1"
		>
			{@render children()}
		</div>
	{/key}
</div>
