<script lang="ts">
	import { blur } from '$lib/transitions';
	import { quintOut } from 'svelte/easing';
	import '../app.css';
	import { beforeNavigate } from '$app/navigation';
	import PyroLogo from '$lib/components/PyroLogo.svelte';
	let { children, data } = $props();

	let isForwardNav = $state(true);

	beforeNavigate(({ from, to }) => {
		if (to && from) {
			isForwardNav = to.url.pathname.length > from.url.pathname.length;
			console.log(isForwardNav);
		}
	});
</script>

<div class="grid grid-cols-1 grid-rows-1 px-4">
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

<div class="fixed bottom-0 left-0 flex w-screen justify-center px-4 pb-4 text-center text-zinc-600">
	<div>
		© {new Date().getFullYear()} Pyro
		<div class="mx-2 -mb-1 inline-block h-4 w-px bg-zinc-600"></div>
		Authored by&nbsp;<a class="underline" href="https://x.com/notnullptr" target="_blank">nullptr</a
		>
		and
		<a class="underline" href="https://x.com/SticksDev" target="_blank">Sticks</a>
	</div>
</div>
