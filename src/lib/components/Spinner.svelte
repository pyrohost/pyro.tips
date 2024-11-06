<script lang="ts">
	type Props = {
		thickness?: number;
		invert?: boolean;
	};

	const { thickness = 4, invert = false }: Props = $props();
</script>

<div
	class="h-full w-full animate-spin rounded-full {invert
		? 'border-zinc-300 border-b-zinc-700'
		: 'border-zinc-800 border-b-white'}"
	style="border-width: {thickness}px;"
></div>
