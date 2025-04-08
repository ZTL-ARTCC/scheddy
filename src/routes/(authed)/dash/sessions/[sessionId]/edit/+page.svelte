<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import { CalendarIcon, LoaderCircleIcon } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import * as Popover from '$lib/components/ui/popover';
	import * as Form from '$lib/components/ui/form';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today
	} from '@internationalized/date';
	import { cn, ROLE_STAFF } from '$lib/utils';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import { roleOf } from '$lib';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/sessions/${data.sessionInfo.session.id}`);
				toast.success('Session updated!');
			}
		}
	});
	const { form: formData, enhance, delayed } = form;

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	let date = $state<DateValue | undefined>();

	$effect(() => {
		date = $formData.date ? parseDate($formData.date) : undefined;
	});

	let datePlaceholder = $state<DateValue>(today(getLocalTimeZone()));

	function pad() {
		$formData.hour = String($formData.hour).padStart(2, '0');
		$formData.minute = String($formData.minute).padStart(2, '0');
	}
</script>

<h2 class="text-xl font-semibold">Edit Session</h2>

<form class="flex flex-col gap-2 max-w-sm" method="POST" action="?/edit"  use:enhance>
	<p class="text-sm text-muted-foreground">
		Enter all dates and times in {data.sessionInfo.session.timezone}, where it's currently {DateTime.now()
			.setZone(data.sessionInfo.session.timezone)
			.toLocaleString(DateTime.TIME_SIMPLE)}
	</p>

	<Form.Field {form} name="date" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Date</Form.Label>
				<Popover.Root>
					<Popover.Trigger
						{...props}
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'justify-start pl-4 text-left font-normal',
							!date && 'text-muted-foreground'
						)}
					>
						{date ? df.format(date.toDate(getLocalTimeZone())) : 'Pick a date'}
						<CalendarIcon class="ml-auto size-4 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" side="top">
						<Calendar
							type="single"
							value={date as DateValue}
							bind:placeholder={datePlaceholder}
							calendarLabel="Date"
							onValueChange={(v) => {
								if (v) {
									$formData.date = v.toString();
								} else {
									$formData.date = '';
								}
							}}
						/>
					</Popover.Content>
				</Popover.Root>
				<Form.FieldErrors />
				<input hidden value={$formData.date} name={props.name} />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<div class="flex flex-row gap-2">
		<Form.Field {form} name="hour">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Time</Form.Label>
					<Input
						onblur={pad}
						{...props}
						type="number"
						bind:value={$formData.hour}
						min="0"
						max="23"
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Hours (HH)</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<span class="mt-8">:</span>
		<Form.Field {form} name="minute">
			<Form.Control>
				{#snippet children({ props })}
					<!-- required for spacing. it's cursed -->
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					<Form.Label>​</Form.Label>
					<Input
						onblur={pad}
						{...props}
						type="number"
						bind:value={$formData.minute}
						min="0"
						max="59"
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Minutes (MM)</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="type">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Type</Form.Label>
				<Select.Root type="single" bind:value={$formData.type} name={props.name}>
					<Select.Trigger {...props}>
						{$formData.type
							? `${data.typesMap[$formData.type].name} (${data.typesMap[$formData.type].length} minutes)`
							: 'Select a session type'}
					</Select.Trigger>
					<Select.Content>
						{#each Object.entries(data.typesMap) as [id, type] (id)}
							<Select.Item value={id} label="{type.name} ({type.length} minutes)" />
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if roleOf(data.user) >= ROLE_STAFF}
		<UserSelector
			label="Mentor"
			{form}
			usersMap={data.usersMap}
			name="mentor"
			bind:value={$formData.mentor}
		/>
	{/if}

	<Form.Button>
		{#if $delayed}
			<LoaderCircleIcon class="animate-spin size-4" />
		{:else}
			Save
		{/if}
	</Form.Button>
</form>
