<script lang="ts">
	import type { PageData } from './$types';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { availSchema } from './availSchema';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { DateTime } from 'luxon';
	import WeekdayAvailability from './WeekdayAvailability.svelte';
	import SpecificDateAvailability from './SpecificDateAvailability.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		validators: zodClient(availSchema),
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/mentors/${data.mentor.id}`);
				toast.success('Availability updated!');
			}
		}
	});
	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="timezone">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Timezone</Form.Label>
				<Select.Root type="single" bind:value={$formData.timezone} name={props.name}>
					<Select.Trigger {...props}
						>{$formData.timezone
							? $formData.timezone
							: 'Select your local timezone'}</Select.Trigger
					>
					<Select.Content>
						{#each data.timezones as zone (zone.name)}
							<Select.Item value={zone.name} label={zone.name}
								>{zone.name} ({zone.alternativeName})</Select.Item
							>
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>
			Enter all times on this page local to your selection, <b>{$formData.timezone}</b>, where it's
			currently
			<b>{DateTime.local().setZone($formData.timezone).toLocaleString(DateTime.TIME_SIMPLE)}</b>.
			Not sure what to pick? Your browser thinks you're in the zone
			<b>{DateTime.local().zone.name}</b>, where it's currently
			<b>{DateTime.local().toLocaleString(DateTime.TIME_SIMPLE)}</b>.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<div class="block md:hidden">
		<Tabs.Root value="weekdays">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="weekdays">Weekday Availability</Tabs.Trigger>
				<Tabs.Trigger value="overrides">Specific Date Availability</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="weekdays">
				<WeekdayAvailability {form} />
			</Tabs.Content>
			<Tabs.Content value="overrides">
				<SpecificDateAvailability {form} />
			</Tabs.Content>
		</Tabs.Root>
	</div>
	<div class="hidden md:flex flex-row gap-4">
		<WeekdayAvailability {form} />
		<Separator orientation="vertical" />
		<SpecificDateAvailability {form} />
	</div>
	<Form.Button class="mt-2 w-full">Set Availability</Form.Button>
	<SuperDebug data={$formData} />
</form>
