<script lang="ts">
	import type { DateTime } from 'luxon';
	import { cn } from 'tailwind-variants';
	import { backgroundColors, type Session } from './utils';

	interface Props {
		session: Session;
		sessionStart: DateTime;
		sessionEnd: DateTime;
	}

	const isCompact = (start: DateTime, end: DateTime, min: number) => {
		const minutes = end.diff(start, 'minutes').minutes;
		return minutes <= min;
	};

	let { session, sessionStart, sessionEnd }: Props = $props();
</script>

<div
	class={cn(
		'overflow-hidden h-full flex justify-center flex-c',
		isCompact(sessionStart, sessionEnd, 15) ? 'flex-row items-center gap-2' : 'flex-col'
	)}
>
	<p class="font-semibold">
		{session.sessionType.name}
	</p>
	<p>
		{session.student.firstName}
		{session.student.lastName}
	</p>
	<p class={`${isCompact(sessionStart, sessionEnd, 15) ? 'hidden' : ''}`}>
		{sessionStart.toFormat('h:mm a')} - {sessionEnd.toFormat('h:mm a')}
	</p>
	<p>
		with {session.mentor.firstName}
		{session.mentor.lastName}
	</p>
</div>
