<script lang="ts">
	import { DateTime } from 'luxon';
	import type { PageData } from '../$types';
	import { cn } from '$lib/utils';
	import TimeColumn from '$lib/ui/cal/TimeColumn.svelte';
	import CalendarHeader from '$lib/ui/cal/CalendarHeader.svelte';
	import DateHeader from '$lib/ui/cal/DateHeader.svelte';
	import type { Session } from '$lib/ui/cal/utils';
	import Events from '$lib/ui/cal/Events.svelte';

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

<div class="flex flex-col w-full border-2 rounded-xl" style="max-height: calc(100vh - 5rem);">
	<CalendarHeader
		{selectedDay}
		{selectedWeekStart}
		{selectedWeekEnd}
		{view}
		onViewChange={(newView: string) => (view = newView)}
		onSelectedDayChange={(newDay: DateTime) => (selectedDay = newDay)}
	/>
	<div class="flex flex-col w-full rounded-b-xl overflow-hidden">
		<div class="relative overflow-y-auto">
			<div class="sticky top-0 z-50 bg-background">
				<DateHeader {selectedDay} {selectedWeekStart} {view} />
			</div>

			<div class="grid grid-cols-29">
				<TimeColumn />

				{#key `${selectedWeekStart.toISODate()}-${selectedDay}-${view}`}
					{#each Array(view === 'week' ? 7 : 1) as _, day}
						<div
							class={cn(
								'grid grid-rows-48 border-r relative',
								view === 'week' ? 'col-span-4' : 'col-span-28',
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
							<Events
								user={data.user}
								{sessions}
								{view}
								date={selectedDay.toISODate()}
								{selectedWeekStart}
								{day}
							/>
						</div>
					{/each}
				{/key}
			</div>
		</div>
	</div>
</div>
