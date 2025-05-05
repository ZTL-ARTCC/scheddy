<script lang="ts">
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import type { AvailSchema } from './availSchema';
	import WeekdayAvailabiltyControl from './WeekdayAvailabiltyControl.svelte';

	interface Props {
		form: SuperForm<Infer<AvailSchema>>;
	}

	let days = [
		{ id: 'sunday', name: 'Sunday' },
		{ id: 'monday', name: 'Monday' },
		{ id: 'tuesday', name: 'Tuesday' },
		{ id: 'wednesday', name: 'Wednesday' },
		{ id: 'thursday', name: 'Thursday' },
		{ id: 'friday', name: 'Friday' },
		{ id: 'saturday', name: 'Saturday' }
	];

	let { form }: Props = $props();
	const { form: formData } = form;
</script>

<div class="flex-1 flex flex-col gap-2">
	<h2 class="text-center font-bold text-lg">Weekday Availability</h2>
	<p class="text-sm text-muted-foreground">
		Set your general availability to be repeated every week. Check the box to mark that you are
		available for that day, and add specific hours of availability. If a box is unchecked, you are
		NOT available on that day.
	</p>
	{#each days as day (day.id)}
		<WeekdayAvailabiltyControl {form} dayId={day.id} dayName={day.name} />
	{/each}
</div>
