<script lang="ts">
	import { goto } from '$app/navigation';
	import { roleOf } from '$lib';
	import { DateTime } from 'luxon';
	import type { Session } from './utils';
	import type { users } from '$lib/server/db/schema';
	import { ROLE_STAFF } from '$lib/utils';
	import { getStyledSessions } from './placing';
	import CalendarCard from './CalendarCard.svelte';

	interface Props {
		user: typeof users.$inferSelect;
		sessions: Session[];
		view: string;
		date: string;
		selectedWeekStart: DateTime;
		day: number;
	}

	const { user, sessions, view, date, selectedWeekStart, day }: Props = $props();

	const cellDate = selectedWeekStart.plus({ days: day });

	const sessionsToday = sessions.filter((s) => {
		if (view === 'week') {
			const start = DateTime.fromISO(s.session.start);
			return start.toISODate() === cellDate.toISODate();
		} else if (view === 'day') {
			return DateTime.fromISO(s.session.start).toISODate() === date;
		}
	});
	const styledSessions = getStyledSessions(sessionsToday);
</script>

{#each styledSessions as session (session.session.id)}
	<button
		onclick={() => {
			if (session.session.mentor === user.id || roleOf(user) >= ROLE_STAFF) {
				goto(`/dash/sessions/${session.session.id}`);
			}
		}}
		class="absolute rounded-lg text-xs cursor-pointer overflow-hidden shadow-lg hover:brightness-90"
		style={session.style}
	>
		<CalendarCard {session} sessionStart={session.start} sessionEnd={session.end} />
	</button>
{/each}
