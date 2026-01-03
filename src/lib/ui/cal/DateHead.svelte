<script lang="ts">
	import { DateTime } from 'luxon';

	interface Props {
		selectedDay: DateTime;
		selectedWeekStart: DateTime;
		view: string;
	}

	let { selectedDay, selectedWeekStart, view }: Props = $props();

	const today = DateTime.now();
</script>

<div
	class="grid w-full border-b text-center font-semibold text-sm"
	class:grid-cols-29={view === 'week'}
	class:grid-cols-4={view === 'day'}
>
	{#if view === 'week'}
		<div class="border-r"></div>
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
			class="col-span-4 flex flex-col items-center justify-center py-3 text-sm"
			class:bg-muted={selectedDay.hasSame(today, 'day')}
		>
			<span class="uppercase tracking-wider text-xs text-muted-foreground">
				{selectedDay.weekdayLong}
			</span>
			<span class="text-base font-semibold">{selectedDay.day}</span>
		</div>
	{/if}
</div>
