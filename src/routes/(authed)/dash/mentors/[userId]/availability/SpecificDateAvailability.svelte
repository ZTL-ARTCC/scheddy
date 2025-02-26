<script lang="ts">
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import type { AvailSchema } from './availSchema';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { CalendarIcon } from 'lucide-svelte';
	import { Calendar } from '$lib/components/ui/calendar';
	import SpecificDateAvailabilityControl from './SpecificDateAvailabilityControl.svelte';

	interface Props {
		form: SuperForm<Infer<AvailSchema>>;
	}
	let { form }: Props = $props();
	const { form: formData } = form;

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let dateAdd: DateValue | undefined = $state(undefined);
	function addException() {
		if (dateAdd) {
			if (!Object.keys($formData.exceptions).includes(dateAdd.toString())) {
				$formData.exceptions[dateAdd.toString()] = {
					available: false,
					start: { hour: 0, minute: 0 },
					end: { hour: 0, minute: 0 }
				};
			}
		}
		dateAdd = undefined;
	}
</script>

<div class="flex-1 flex flex-col gap-2">
	<h2 class="text-center font-bold text-lg">Specific Date Availability</h2>
	<p class="text-sm text-muted-foreground">
		Add specific dates to override your availability for a specific day. Check the box to mark that
		you are available for that day, and add specific hours of availability. If the box is unchecked,
		you are NOT available on that day.
	</p>

	<div class="flex flex-row gap-4">
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						variant="outline"
						class={cn(
							'flex-1 justify-start text-left font-normal',
							!dateAdd && 'text-muted-foreground'
						)}
						{...props}
					>
						<CalendarIcon />
						{dateAdd ? df.format(dateAdd.toDate(getLocalTimeZone())) : 'Pick a date'}
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<Calendar type="single" bind:value={dateAdd} />
			</Popover.Content>
		</Popover.Root>
		<Button onclick={addException}>Add override &rarr;</Button>
	</div>
	{#each Object.keys($formData.exceptions) as dateId}
		<SpecificDateAvailabilityControl dayId={dateId} {form} />
	{/each}
</div>
