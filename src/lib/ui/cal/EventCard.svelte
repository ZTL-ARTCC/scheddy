<script lang="ts">
	import { DateTime } from 'luxon';
	import type { Session } from './utils';
	import { cn } from '$lib/utils';

	interface Props {
		session: Session;
		sessionStart: DateTime;
		sessionEnd: DateTime;
	}

	let { session, sessionStart, sessionEnd }: Props = $props();
</script>

<div
	class={cn(
		'h-full flex justify-center text-center',
		session.sessionType.length < 25 ? 'flex-row gap-2 items-center' : 'flex-col'
	)}
>
	<p class="font-semibold text-white">
		{session.sessionType.name}
	</p>
	<p class="text-white truncate">
		{session.student.firstName}
		{session.student.lastName}
	</p>
	{#if session.sessionType.length >= 30}
		<p class="text-white truncate">
			{sessionStart.toFormat('h:mm a')} - {sessionEnd.toFormat('h:mm a')}
		</p>
		{#if session.sessionType.length >= 45}
			<p class="text-white truncate">
				with {session.mentor.firstName}
				{session.mentor.lastName}
			</p>
		{/if}
	{/if}
</div>
