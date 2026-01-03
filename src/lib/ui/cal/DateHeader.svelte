<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTimeZones } from '@vvo/tzdb';
	import { DateTime } from 'luxon';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		selectedDay: DateTime;
		selectedWeekStart: DateTime;
		view: string;
	}

	let { selectedDay, selectedWeekStart, view, class: className, ...restProps }: Props = $props();

	const today = DateTime.now();

	const timezone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
	const offset = DateTime.now().setZone(timezone).toFormat('Z');
</script>

<div
	class={cn('grid grid-cols-29 w-full border-b text-center font-semibold text-sm', className)}
	{...restProps}
>
	<div class="border-r text-xs text-muted-foreground flex flex-col justify-center gap-1">
		<div>{timezone}</div>
		<div class="text-[10px]">UTC {offset}</div>
	</div>
	{#if view === 'week'}
		{#each Array(7) as _, i}
			<div
				class="col-span-4 flex flex-col items-center justify-center py-3 text-sm"
				class:border-r={i !== 6}
				class:bg-muted={selectedWeekStart.plus({ days: i }).hasSame(today, 'day')}
			>
				<span class="uppercase tracking-wider text-xs text-muted-foreground">
					{selectedWeekStart.plus({ days: i }).weekdayShort}
				</span>
				<span class="text-base font-semibold">
					{selectedWeekStart.plus({ days: i }).day}
				</span>
			</div>
		{/each}
	{:else if view === 'day'}
		<div
			class="col-span-28 flex flex-col items-center justify-center py-3 text-sm"
			class:bg-muted={selectedDay.hasSame(today, 'day')}
		>
			<span class="uppercase tracking-wider text-xs text-muted-foreground">
				{selectedDay.weekdayLong}
			</span>
			<span class="text-base font-semibold">{selectedDay.day}</span>
		</div>
	{/if}
</div>
