<script lang="ts">
	type Props = {
		thickness?: number;
	};

	const { thickness = 4 }: Props = $props();
</script>

<div
	class="h-full w-full animate-spin rounded-full border-zinc-800 border-b-white"
	style="border-width: {thickness}px;"
></div>
