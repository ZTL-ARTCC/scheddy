<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import { CalendarDaysIcon, ClockIcon, GraduationCapIcon, IdCardIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import DataDisplay from './DataDisplay.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<h2 class="text-xl font-semibold">Session Information</h2>

<table class="max-w-2xl">
	<tbody>
		<DataDisplay icon={GraduationCapIcon} label="Student">
			{data.sessionInfo.student.firstName}
			{data.sessionInfo.student.lastName}
		</DataDisplay>
		<DataDisplay icon={IdCardIcon} label="Mentor">
			{data.sessionInfo.mentor.firstName}
			{data.sessionInfo.mentor.lastName}
		</DataDisplay>
		<DataDisplay icon={CalendarDaysIcon} label="Date">
			{DateTime.fromISO(data.sessionInfo.session.start).toLocaleString(DateTime.DATETIME_HUGE)}
		</DataDisplay>
		<DataDisplay icon={ClockIcon} label="Duration">
			{data.sessionInfo.sessionType.length} minutes
		</DataDisplay>
	</tbody>
</table>

<div class="flex flex-row flex-wrap gap-2">
	<Button href="/dash/sessions/{data.sessionInfo.session.id}/edit">Edit</Button>
	<Button href="/dash/sessions/{data.sessionInfo.session.id}/cancel" variant="destructive"
		>Cancel</Button
	>
</div>
