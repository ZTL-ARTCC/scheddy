<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/ui/Card.svelte';

	interface Props {
		children: Snippet;
		open: boolean;
		onclose: () => void;
	}
	let { children, open = $bindable(), onclose }: Props = $props();
</script>

<!-- eslint-disable-next-line -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onclick={onclose}
	class:hidden={!open}
	class:pointer-events-none={!open}
	class="inset-0 transition-colors z-50 min-w-screen w-screen min-h-screen absolute top-0 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm flex items-center align-middle justify-center"
>
	<Card
		onclick={(e) => {
			e.stopPropagation();
		}}
		class="shadow-xl p-0 transition-all {open ? 'scale-100 opacity-100' : 'scale-125 opacity-0'}"
	>
		{@render children()}
	</Card>
</div>
