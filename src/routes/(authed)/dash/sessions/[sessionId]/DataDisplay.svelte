<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon: Component;
		label: string;
		children: Snippet;
	}
	let props: Props = $props();
	let { label, children } = props;
</script>

<tr>
	<td class="flex flex-col gap-2 py-1 mt-2 lg:mt-0">
		<div class="flex flex-row items-center gap-2">
			<props.icon class="size-6 text-muted-foreground" />
			<span class="text-muted-foreground text-sm font-semibold">{label}</span>
		</div>
	</td>
	<td class="py-1 block lg:table-cell">{@render children?.()}</td>
</tr>
