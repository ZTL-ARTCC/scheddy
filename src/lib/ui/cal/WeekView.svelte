<script lang="ts">
	import { goto } from '$app/navigation';
	import { roleOf } from '$lib';
	import { DateTime } from 'luxon';
	import CalenderCard from './CalenderCard.svelte';
	import {
		assignLayers,
		backgroundColors,
		findHeight,
		findLayerOffset,
		findMargin,
		type Session
	} from './utils';
	import type { users } from '$lib/server/db/schema';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		user: typeof users.$inferSelect;
		mentorSessions: Session[];
		day: number;
		hour: number;
		selectedWeekStart: DateTime;
	}

	let { user, mentorSessions, day, hour, selectedWeekStart }: Props = $props();
	const layers = assignLayers(mentorSessions);
</script>

{#each mentorSessions as session}
	{@const sessionStart = DateTime.fromISO(session.session.start)}
	{@const sessionEnd = sessionStart.plus({ minutes: session.sessionType!.length })}
	{@const slotStart = selectedWeekStart.plus({
		days: day,
		hours: Math.floor(hour / 2),
		minutes: (hour % 2) * 30
	})}
	{@const layer = layers.findIndex((s) => s.includes(session))}
	{@const offset = findLayerOffset(layer, layers.length)}

	{#if sessionStart.hasSame(selectedWeekStart.plus( { days: day } ), 'day') && sessionStart.hour === Math.floor(hour / 2) && Math.floor(sessionStart.minute / 30) * 30 === (hour % 2) * 30}
		<button
			onclick={() => {
				if (session.session.mentor === user.id || roleOf(user) >= ROLE_STAFF) {
					goto(`/dash/sessions/${session.session.id}`);
				}
			}}
			class="absolute top-0 max-w-[95%] rounded-md text-xs cursor-pointer overflow-hidden"
			style={`height: ${findHeight(sessionStart, sessionEnd)}rem; background-color: ${
				backgroundColors[(Math.random() * backgroundColors.length) | 0]
			};
			left: ${offset}%;
			margin-top: ${findMargin(sessionStart, slotStart)}rem;
			z-index: ${layer + 1};
			`}
		>
			<CalenderCard {session} {sessionStart} {sessionEnd} />
		</button>
	{/if}
{/each}
