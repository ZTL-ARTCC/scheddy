<script lang="ts">
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import type { AvailSchema } from './availSchema';
	import WeekdayAvailabiltyControl from './WeekdayAvailabiltyControl.svelte';

	interface Props {
		form: SuperForm<Infer<AvailSchema>>;
	}

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
	<WeekdayAvailabiltyControl
		{form}
		dayId="sunday"
		dayName="Sunday"
		bind:available={$formData.sunday.available}
		bind:startHour={$formData.sunday.start.hour}
		bind:startMinute={$formData.sunday.start.minute}
		bind:endHour={$formData.sunday.end.hour}
		bind:endMinute={$formData.sunday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="monday"
		dayName="Monday"
		bind:available={$formData.monday.available}
		bind:startHour={$formData.monday.start.hour}
		bind:startMinute={$formData.monday.start.minute}
		bind:endHour={$formData.monday.end.hour}
		bind:endMinute={$formData.monday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="tuesday"
		dayName="Tuesday"
		bind:available={$formData.tuesday.available}
		bind:startHour={$formData.tuesday.start.hour}
		bind:startMinute={$formData.tuesday.start.minute}
		bind:endHour={$formData.tuesday.end.hour}
		bind:endMinute={$formData.tuesday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="wednesday"
		dayName="Wednesday"
		bind:available={$formData.wednesday.available}
		bind:startHour={$formData.wednesday.start.hour}
		bind:startMinute={$formData.wednesday.start.minute}
		bind:endHour={$formData.wednesday.end.hour}
		bind:endMinute={$formData.wednesday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="thursday"
		dayName="Thursday"
		bind:available={$formData.thursday.available}
		bind:startHour={$formData.thursday.start.hour}
		bind:startMinute={$formData.thursday.start.minute}
		bind:endHour={$formData.thursday.end.hour}
		bind:endMinute={$formData.thursday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="friday"
		dayName="Friday"
		bind:available={$formData.friday.available}
		bind:startHour={$formData.friday.start.hour}
		bind:startMinute={$formData.friday.start.minute}
		bind:endHour={$formData.friday.end.hour}
		bind:endMinute={$formData.friday.end.minute}
	/>
	<WeekdayAvailabiltyControl
		{form}
		dayId="saturday"
		dayName="Saturday"
		bind:available={$formData.saturday.available}
		bind:startHour={$formData.saturday.start.hour}
		bind:startMinute={$formData.saturday.start.minute}
		bind:endHour={$formData.saturday.end.hour}
		bind:endMinute={$formData.saturday.end.minute}
	/>
</div>
