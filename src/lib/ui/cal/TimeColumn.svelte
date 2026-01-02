<script lang="ts">
	import { DateTime } from 'luxon';
</script>

<div class="grid grid-rows-48 h-full">
	{#each Array(48) as _, hour}
		<div
			class="h-12 border-r flex flex-col justify-start"
			class:border-b={hour < 47}
			class:border-b-dashed={hour % 2 === 0}
		>
			{#if hour % 2 === 0}
				<div class="text-xs text-muted-foreground text-center leading-none pt-1">
					{DateTime.fromObject({ hour: hour / 2, minute: 0 }).toFormat('h a')}
				</div>
			{/if}
		</div>
	{/each}
</div>
