<script lang="ts">
	import { findHeight, type StyledSession } from './utils';
	import { cn } from '$lib/utils';

	interface Props {
		session: StyledSession;
		selectedDateISO: string;
	}

	let { session, selectedDateISO }: Props = $props();

	const dayLength = findHeight(selectedDateISO, session.start, session.end) * 10;
	const styleLength = Math.min(dayLength, session.sessionType.length);
</script>

<div
	class={cn(
		'h-full flex justify-center text-center',
		styleLength < 25 ? 'flex-row gap-2 items-center' : 'flex-col'
	)}
>
	<p class="font-semibold text-white truncate">
		{session.sessionType.name}
	</p>
	<p class="text-white truncate">
		{session.student.firstName}
		{session.student.lastName}
	</p>
	{#if styleLength >= 30}
		<p class="text-white truncate">
			{session.start.toFormat('h:mm a')} - {session.end.toFormat('h:mm a')}
		</p>
		{#if styleLength >= 45}
			<p class="text-white truncate">
				with {session.mentor.firstName}
				{session.mentor.lastName}
			</p>
		{/if}
	{/if}
</div>
