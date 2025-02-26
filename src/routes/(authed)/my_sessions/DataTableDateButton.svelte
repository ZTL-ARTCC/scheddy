<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let {
		variant = 'ghost',
		isSorted,
		...restProps
	}: ComponentProps<typeof Button> & { isSorted: false | 'asc' | 'desc' } = $props();
</script>

<Button {variant} {...restProps}>
	Date & time
	{#if !isSorted}
		<ArrowUpDown class="ml-2" />
	{:else if isSorted === 'asc'}
		<ArrowUp class="ml-2" />
	{:else}
		<ArrowDown class="ml-2" />
	{/if}
</Button>
