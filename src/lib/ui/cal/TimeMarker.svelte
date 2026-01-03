<!-- Messy, should probably be redone at some point but it does the job -->
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('absolute left-0 right-0 top-0', className)} {...restProps}>
	<div class="absolute -translate-y-1/2 -translate-x-1/2 size-2 rounded-full bg-red-500"></div>
	<div class="absolute w-full border-t-red-500 border-t -translate-y-[1px]"></div>
</div>
