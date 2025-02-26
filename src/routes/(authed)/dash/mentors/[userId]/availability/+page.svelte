<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
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
</form>

<!--
<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-semibold">
		Editing availability - {data.mentor.firstName}
		{data.mentor.lastName}
	</h1>

	<form method="POST" use:enhance>
		<div class="px-4 flex flex-col text-left gap-4">
			<Select
				name="timezone"
				bind:value={$form.timezone}
				{...$constraints.timezone}
				label="Timezone"
			>
				{#each timezones as tz}
					<option value={tz.name}>{tz.name} ({tz.alternativeName})</option>
				{/each}
			</Select>
			<span
				>Select the city closest to your location, to ensure that times are displayed correctly for
				you. Times below are entered <i>in this timezone.</i></span
			>
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1 flex flex-col gap-2">
					<h2 class="text-lg font-semibold">By weekday</h2>
					<div class="flex flex-col gap-3">
						{#each ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as day}
							{@const key = day.toLowerCase()}
							<div>
								<h3 class="text-lg font-semibold">{day}</h3>
								<div class="flex flex-row gap-2 align-baseline">
									<label for="av-s">Available?</label>
									<input
										class="w-6 h-6 border-blue-500 ring-blue-500 rounded bg-transparent"
										id="av-s"
										type="checkbox"
										bind:checked={$form[key].available}
									/>
								</div>
								{#if $form[key].available}
									<div class="flex flex-row gap-4">
										<Input
											label="Start Time Hour"
											bind:value={$form[key].start.hour}
											name="{key}.start.hour"
											error={$errors[key]?.start.hour}
										/>
										<Input
											label="Minute"
											bind:value={$form[key].start.minute}
											name="{key}.start.minute"
											error={$errors[key]?.start.minute}
										/>
									</div>
									<div class="flex flex-row gap-4">
										<Input
											label="End Time Hour"
											bind:value={$form[key].end.hour}
											name="{key}.end.hour"
											error={$errors[key]?.end.hour}
										/>
										<Input
											label="Minute"
											bind:value={$form[key].end.minute}
											name="{key}.end.minute"
											error={$errors[key]?.end.minute}
										/>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<div class="flex-1 flex flex-col gap-2">
					<h2 class="text-lg font-semibold">Date exceptions</h2>
					<i
						><b>First,</b> enter a date of interest, then press Add Exception. You can edit it afterwards.</i
					>

					<input
						class="bg-slate-950 border-blue-500 ring-blue-500 rounded"
						type="date"
						bind:value={addDateStr}
					/>
					<Button
						action="none"
						disabled={!addDateStr}
						onclick={(e) => {
							e.preventDefault();
							if (!$form.exceptions) {
								$form.exceptions = {};
							}
							if (!$errors.exceptions) {
								$errors.exceptions = {};
							}
							$form.exceptions[addDateStr] = {
								available: false,
								start: {
									hour: 0,
									minute: 0
								},
								end: {
									hour: 0,
									minute: 0
								}
							};
							$form = $form; // weird svelte bug
							addDateStr = '';
						}}>Add Exception</Button
					>

					{#each Object.keys($form.exceptions) as key}
						{#if $form.exceptions[key] === undefined}
							<p>Uh oh! Something has broken...</p>
							<p>
								Please click this button 5 times as quickly as you can, then ping Tyler in Discord:
							</p>
							<Button>Click me</Button>
							<p>Thanks.</p>
							<p>**DO NOT PRESS SET, YOUR AVAILABILITY WILL BREAK**</p>
						{:else}
							<h3 class="text-lg font-semibold">{key}</h3>
							<div class="flex flex-row gap-2 align-baseline">
								<label for="av-s">Available?</label>
								<input
									class="w-6 h-6 border-blue-500 ring-blue-500 rounded bg-transparent"
									id="av-s"
									type="checkbox"
									bind:checked={$form.exceptions[key].available}
								/>
								<Button
									action="none"
									onclick={(e) => {
										e.preventDefault();
										delete $form.exceptions[key];
										$form.exceptions = $form.exceptions;
									}}
									class="ml-4 w-6 h-6"
									size="icon"
									variant="danger"
								>
									<TrashIcon class="w-2 h-2" />
								</Button>
							</div>
							{#if $form.exceptions[key].available}
								<div class="flex flex-row gap-4">
									<Input
										label="Start Time Hour"
										bind:value={$form.exceptions[key].start.hour}
										name="exceptions.{key}.start.hour"
									/>
									<Input
										label="Minute"
										bind:value={$form.exceptions[key].start.minute}
										name="exceptions.{key}.start.minute"
									/>
								</div>
								<div class="flex flex-row gap-4">
									<Input
										label="End Time Hour"
										bind:value={$form.exceptions[key].end.hour}
										name="exceptions.{key}.end.hour"
									/>
									<Input
										label="Minute"
										bind:value={$form.exceptions[key].end.minute}
										name="exceptions.{key}.end.minute"
									/>
								</div>
							{/if}
						{/if}
					{/each}
				</div>
			</div>

			<Button>Set</Button>
		</div>
	</form>
</div>
-->
