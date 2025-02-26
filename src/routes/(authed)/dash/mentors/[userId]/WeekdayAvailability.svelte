<script lang="ts">
	import WeekdayAvailabiltyControl from './WeekdayAvailabiltyControl.svelte';
	import type { MentorAvailability } from '$lib/availability';

	interface Props {
		data: MentorAvailability;
	}

	let { data }: Props = $props();
</script>

<div class="flex-1 flex flex-col gap-2">
	<h2 class="text-center font-bold text-lg">Weekday Availability</h2>
	<p class="text-sm text-muted-foreground">General availability to be repeated every week.</p>
	<WeekdayAvailabiltyControl {data} dayId="sunday" dayName="Sunday" />
	<WeekdayAvailabiltyControl {data} dayId="monday" dayName="Monday" />
	<WeekdayAvailabiltyControl {data} dayId="tuesday" dayName="Tuesday" />
	<WeekdayAvailabiltyControl {data} dayId="wednesday" dayName="Wednesday" />
	<WeekdayAvailabiltyControl {data} dayId="thursday" dayName="Thursday" />
	<WeekdayAvailabiltyControl {data} dayId="friday" dayName="Friday" />
	<WeekdayAvailabiltyControl {data} dayId="saturday" dayName="Saturday" />
</div>
