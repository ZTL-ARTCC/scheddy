<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { NestedMenuItem } from './nav';
	import NavItem from './NavItem.svelte';

	interface Props {
		data: NestedMenuItem[];
		title?: string;
	}
	let { data, title }: Props = $props();
</script>

<Sidebar.Group>
	{#if title}
		<Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
	{/if}
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			<NavItem {data} isSub={false} />
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
