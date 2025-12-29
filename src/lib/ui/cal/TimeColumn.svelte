<script lang="ts">
	import { DateTime } from 'luxon';

	interface Props {
		hour: number;
	}

	let { hour }: Props = $props();
</script>

<div class="border-r" class:border-b={hour < 47} class:border-b-dashed={hour % 2 === 0}>
	{#if hour % 2 === 0}
		<div class="text-xs text-muted-foreground text-center">
			{DateTime.fromObject({ hour: hour / 2, minute: 0 }).toFormat('h a')}
		</div>
	{/if}
</div>
