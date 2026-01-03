<script lang="ts">
	import { roleOf } from '$lib';
	import { DateTime } from 'luxon';
	import type { Session } from './utils/utils';
	import type { users } from '$lib/server/db/schema';
	import { cn, ROLE_STAFF } from '$lib/utils';
	import { getStyledSessions } from './utils/placing';
	import EventCard from './EventCard.svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		user: typeof users.$inferSelect;
		sessions: Session[];
		view: string;
		date: string;
		selectedWeekStart: DateTime;
		day: number;
		backgroundByType: Record<string, string>;
	}

	let {
		user,
		sessions,
		view,
		date,
		selectedWeekStart,
		day,
		backgroundByType,
		class: className,
		...restProps
	}: Props = $props();

	const cellDate = selectedWeekStart.plus({ days: day });

	const sessionsToday = sessions.filter((s) => {
		const start = DateTime.fromISO(s.session.start);
		const end = start.plus({ minutes: s.sessionType.length });
		if (view === 'week') {
			return (
				start.toISODate() === cellDate.toISODate() ||
				end.toISODate() === cellDate.toISODate() ||
				(start < cellDate.startOf('day') && end > cellDate.endOf('day'))
			);
		} else if (view === 'day') {
			return (
				start.toISODate() === date ||
				end.toISODate() === date ||
				(start < cellDate.startOf('day') && end > cellDate.endOf('day'))
			);
		}
	});

	const selectedDateISO = view === 'week' ? cellDate.toISODate()! : date;

	const styledSessions = getStyledSessions(sessionsToday, selectedDateISO, backgroundByType);
</script>

<div class={className} {...restProps}>
	{#each styledSessions as session (session.session.id)}
		{@const hasAuth = session.session.mentor === user.id || roleOf(user) >= ROLE_STAFF}

		<a
			href={hasAuth ? `/dash/sessions/${session.session.id}` : undefined}
			class={cn(
				'absolute rounded-lg text-xs overflow-hidden shadow-lg hover:brightness-90 hover:shadow-xl border-1 p-1',
				hasAuth ? 'cursor-pointer' : 'cursor-default'
			)}
			style={session.style}
		>
			<EventCard {session} {selectedDateISO} />
		</a>
	{/each}
</div>
