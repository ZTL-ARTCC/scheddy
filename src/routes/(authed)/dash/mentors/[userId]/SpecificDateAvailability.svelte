<script lang="ts">
	import SpecificDateAvailabilityControl from './SpecificDateAvailabilityControl.svelte';
	import type { MentorAvailability } from '$lib/availability';

	interface Props {
		data: MentorAvailability;
	}
	let { data }: Props = $props();
</script>

<div class="flex-1 flex flex-col gap-2">
	<h2 class="text-center font-bold text-lg">Specific Date Availability</h2>
	<p class="text-sm text-muted-foreground">
		Specific dates to override availability for a specific day.
	</p>

	{#each Object.keys(data.exceptions) as dateId}
		<SpecificDateAvailabilityControl dayId={dateId} {data} />
	{:else}
		<div class="items-center flex flex-col">
			<p class="text-sm text-muted-foreground">No overrides set.</p>
		</div>
	{/each}
</div>
