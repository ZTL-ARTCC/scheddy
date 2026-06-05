<script lang="ts">
	import { findHeight, type StyledSession } from './utils/utils';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		session: StyledSession;
		selectedDateISO: string;
	}

	let { session, selectedDateISO, class: className, ...restProps }: Props = $props();

	const dayLength = $derived(findHeight(selectedDateISO, session.start, session.end) * 10);
	const styleLength = $derived(Math.min(dayLength, session.sessionType.length));

	const mentorBreakpoint = $derived(styleLength >= 45);
	const studentBreakpoint = $derived(styleLength >= 30);
	const rowBreakpoint = $derived(styleLength < 25);
</script>

<div
	class={cn(
		'h-full flex justify-center text-center',
		rowBreakpoint ? 'flex-row gap-2 items-center' : 'flex-col',
		className
	)}
	{...restProps}
>
	<p class=" text-white truncate">
		{session.start.toFormat('h:mm a')} - {session.end.toFormat('h:mm a')}
	</p>
	<p class="text-white truncate">
		{session.sessionType.name}
	</p>
	{#if studentBreakpoint}
		<p class="text-white truncate">
			{session.student.firstName}
			{session.student.lastName}
		</p>
		{#if mentorBreakpoint}
			<p class="text-white truncate">
				with {session.mentor.firstName}
				{session.mentor.lastName}
			</p>
		{/if}
	{/if}
</div>
