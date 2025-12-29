<script lang="ts">
	import { DateTime } from 'luxon';
	import type { PageData } from '../$types';
	import { cn } from '$lib/utils';
	import TimeColumn from '$lib/ui/cal/TimeColumn.svelte';
	import CalendarHeader from '$lib/ui/cal/CalendarHeader.svelte';
	import DateHead from '$lib/ui/cal/DateHead.svelte';
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

		<div
			class="grid flex-1"
			class:grid-cols-29={view === 'week'}
			class:grid-cols-4={view === 'day'}
		>
			{#each Array(48) as _, hour}
				<TimeColumn {hour} />
				{#each Array(view === 'week' ? 7 : 1) as _, day}
					<div
						class={cn(
							'relative h-12 p-2 col-span-4',
							selectedWeekStart.plus({ days: day }).hasSame(today, 'day') && 'bg-muted/30'
						)}
						class:border-b={hour < 47}
						class:border-r={day !== (view === 'week' ? 6 : 0)}
						class:border-b-dashed={hour % 2 === 0}
					>
						{#if view === 'week'}
							<WeekView
								user={data.user}
								mentorSessions={data.mentorSessions}
								{day}
								{hour}
								{selectedWeekStart}
							/>
						{:else}
							<DayView />
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>
