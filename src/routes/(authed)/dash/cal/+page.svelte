<script lang="ts">
	import { DateTime } from 'luxon';
	import type { PageData } from '../$types';
	import { cn, ROLE_STAFF } from '$lib/utils';
	import TimeColumn from '$lib/ui/cal/TimeColumn.svelte';
	import CalendarHeader from '$lib/ui/cal/CalendarHeader.svelte';
	import DateHead from '$lib/ui/cal/DateHead.svelte';
	import {
		assignLayers,
		backgroundColors,
		findHeight,
		findLayerOffset,
		findMargin,
		type Session
	} from '$lib/ui/cal/utils';
	import CalendarCard from '$lib/ui/cal/CalendarCard.svelte';
	import { goto } from '$app/navigation';
	import { roleOf } from '$lib';

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

	const sessions = data.mentorSessions as Session[];
	const layers = assignLayers(sessions);
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
			<TimeColumn />

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
						{#each sessions as session (session.session.id)}
							{@const sessionStart = DateTime.fromISO(session.session.start)}
							{@const sessionEnd = sessionStart.plus({ minutes: session.sessionType.length })}
							{@const layer = layers.findIndex((s) => s.includes(session))}

							{#if sessionStart.hasSame(selectedWeekStart.plus({ days: day }), 'day')}
								<button
									onclick={() => {
										if (
											session.session.mentor === data.user.id ||
											roleOf(data.user) >= ROLE_STAFF
										) {
											goto(`/dash/sessions/${session.session.id}`);
										}
									}}
									class="absolute rounded-lg text-xs cursor-pointer overflow-hidden w-full"
									style={`height: ${findHeight(sessionStart, sessionEnd)}rem; background-color: ${
										backgroundColors[(Math.random() * backgroundColors.length) | 0]
									}; 
									 top: ${findMargin(sessionStart)}rem;
									 width: calc(100% - ${findLayerOffset(layer, layers.length)}%); );
									 z-index: ${layer + 1};
									`}
								>
									<CalendarCard {session} {sessionStart} {sessionEnd} />
								</button>
							{/if}
						{/each}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
