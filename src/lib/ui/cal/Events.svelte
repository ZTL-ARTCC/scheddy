<script lang="ts">
	import { roleOf } from '$lib';
	import { DateTime } from 'luxon';
	import type { Session } from './utils';
	import type { users } from '$lib/server/db/schema';
	import { ROLE_STAFF } from '$lib/utils';
	import { getStyledSessions } from './placing';
	import EventCard from './EventCard.svelte';

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
	<a
		href={session.session.mentor === user.id || roleOf(user) >= ROLE_STAFF
			? `/dash/sessions/${session.session.id}`
			: undefined}
		class="absolute rounded-lg text-xs cursor-pointer overflow-hidden shadow-lg hover:brightness-90 hover:shadow-xl p-1"
		style={session.style}
	>
		<EventCard {session} sessionStart={session.start} sessionEnd={session.end} />
	</a>
{/each}
