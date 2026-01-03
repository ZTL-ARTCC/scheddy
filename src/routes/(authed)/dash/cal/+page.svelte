<script lang="ts">
	import { DateTime } from 'luxon';
	import type { PageData } from '../$types';
	import { cn } from '$lib/utils';
	import TimeColumn from '$lib/ui/cal/TimeColumn.svelte';
	import CalendarHeader from '$lib/ui/cal/CalendarHeader.svelte';
	import DateHead from '$lib/ui/cal/DateHead.svelte';
	import type { Session } from '$lib/ui/cal/utils';
	import WeekView from '$lib/ui/cal/WeekView.svelte';
	import DayView from '$lib/ui/cal/DayView.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const today = DateTime.now();
	let selectedDay = $state(DateTime.now());
	let selectedWeekStart = $derived.by(() =>
		selectedDay.minus({ days: selectedDay.weekday % 7 }).startOf('day')
	);
	let selectedWeekEnd = $derived.by(() => selectedWeekStart.plus({ days: 6 }).endOf('day'));
	let view = $state('week');

	// @ts-ignore sveltekit bug
	const sessions = data.mentorSessions as Session[];
</script>

<div class="flex flex-col w-full h-full border-2 rounded-xl">
	<CalendarHeader
		{selectedDay}
		{selectedWeekStart}
		{selectedWeekEnd}
		{view}
		onViewChange={(newView: string) => (view = newView)}
		onSelectedDayChange={(newDay: DateTime) => (selectedDay = newDay)}
	/>
	<div class="flex flex-col w-full rounded-b-xl overflow-hidden">
		<DateHead {selectedDay} {selectedWeekStart} {view} />

		<div class={cn('grid flex-1', view === 'week' ? 'grid-cols-29' : 'grid-cols-4')}>
			<TimeColumn />

			{#key selectedWeekStart.toISODate()}
				{#each Array(view === 'week' ? 7 : 1) as _, day}
					<div
						class={cn(
							'grid grid-rows-48 col-span-4 border-r relative',
							selectedWeekStart.plus({ days: day }).hasSame(today, 'day') && 'bg-muted/30'
						)}
					>
						{#each Array(48) as _, hour}
							<div
								class="relative h-12 p-2"
								class:border-b={hour < 47}
								class:border-b-dashed={hour % 2 === 0}
							></div>
						{/each}

						{#if view === 'week'}
							<WeekView {sessions} {selectedWeekStart} {day} user={data.user} />
						{:else if view === 'day'}
							<DayView />
						{/if}
					</div>
				{/each}
			{/key}
		</div>
	</div>
</div>
