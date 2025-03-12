<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime, Interval } from 'luxon';
	import { goto } from '$app/navigation';
	import { CalendarIcon, LoaderCircleIcon } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import * as Popover from '$lib/components/ui/popover';
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog';
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
	import type { DayAvailability, MentorAvailability } from '$lib/availability';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/cal`);
				toast.success('Session created!');
			}
		}
	});
	const { form: formData, enhance, delayed } = form;

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	let date = $state<DateValue | undefined>();

	const availableInterval = (
		mentorAvailability: DayAvailability,
		sessionStart: DateTime,
		sessionEnd: DateTime
	) => {
		const dayAvailabilityStart = sessionStart.set({
			hour: mentorAvailability.start.hour,
			minute: mentorAvailability.start.minute - 1
		});
		const dayAvailabilityEnd = sessionStart.set({
			hour: mentorAvailability.end.hour,
			minute: mentorAvailability.end.minute + 1
		});

		const dayAvailabilityInterval = Interval.fromDateTimes(
			dayAvailabilityStart,
			dayAvailabilityEnd
		);

		return (
			dayAvailabilityInterval.contains(sessionStart) && dayAvailabilityInterval.contains(sessionEnd)
		);
	};

	const isMentorAvailable = $derived.by(() => {
		const availability: MentorAvailability | null = data.mentorsMap[$formData.mentor].availability
			? JSON.parse(data.mentorsMap[$formData.mentor].availability as string)
			: null;

		if (!availability) return false;

		const s_date = DateTime.fromISO($formData.date, {
			zone: data.usersMap[$formData.student].timezone
		});

		const start = s_date.set({ hour: $formData.hour, minute: $formData.minute });
		const end = start.plus({ minutes: data.typesMap[$formData.type].length });

		if (
			!availability[start.weekdayLong?.toLowerCase()].available &&
			!availability[end.weekdayLong?.toLowerCase()].available &&
			Object.keys(availability.exceptions).length === 0
		)
			return false;

		const dayAvailability = availability[start.weekdayLong?.toLowerCase()] as DayAvailability;

		if (availableInterval(dayAvailability, start, end)) {
			return true;
		} else {
			for (const exception in availability.exceptions) {
				if ($formData.date === exception) {
					return availableInterval(availability.exceptions[exception], start, end);
				}
			}
		}
	});

	$effect(() => {
		date = $formData.date ? parseDate($formData.date) : undefined;
	});

	let dialogOpen = $state(false);

	let datePlaceholder = $state<DateValue>(today(getLocalTimeZone()));

	function pad() {
		$formData.hour = String($formData.hour).padStart(2, '0');
		$formData.minute = String($formData.minute).padStart(2, '0');
	}

	const usersMap = Object.fromEntries(
		Object.entries(data.usersMap).map(([key, value]) => [Number(key), value.name])
	);

	const mentorMap = Object.fromEntries(
		Object.entries(data.mentorsMap).map(([key, value]) => [Number(key), value.name])
	);
</script>

<h2 class="text-xl font-semibold">Create Session</h2>

<form
	class="flex flex-col gap-2 max-w-sm"
	method="POST"
	action={`?timezone=${data.usersMap[$formData.student].timezone}`}
	use:enhance
>
	<p class="text-sm text-muted-foreground">
		Enter all dates and times in {data.usersMap[$formData.student].timezone}, where it's currently {DateTime.now()
			.setZone(data.usersMap[$formData.student].timezone)
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

	<UserSelector
		label="Mentor"
		{form}
		usersMap={mentorMap}
		name="mentor"
		bind:value={$formData.mentor}
	/>

	{#if roleOf(data.user) >= ROLE_STAFF}
		<UserSelector label="Student" {form} {usersMap} name="student" bind:value={$formData.student} />
	{/if}

	{#if isMentorAvailable}
		<Form.Button>
			{#if $delayed}
				<LoaderCircleIcon class="animate-spin size-4" />
			{:else}
				Create Session
			{/if}
		</Form.Button>
	{:else}
		<Form.Button type="button" onclick={() => (dialogOpen = true)}>Create Session</Form.Button>
	{/if}

	<Dialog.Root open={dialogOpen} onOpenChange={() => (dialogOpen = !dialogOpen)}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Schedule Outside Availability?</Dialog.Title>
				<Dialog.Description>
					This session falls outside of this mentor's availability. Are you sure you want to create
					it?
				</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-row gap-x-4">
				<Form.Button
					type="submit"
					class="w-full"
					onclick={() => {
						dialogOpen = false;
						form.submit();
					}}
				>
					{#if $delayed}
						<LoaderCircleIcon class="animate-spin size-4" />
					{:else}
						Create Session
					{/if}
				</Form.Button>
				<Form.Button
					class="w-full"
					variant="destructive"
					onclick={() => {
						dialogOpen = false;
					}}
				>
					Nevermind
				</Form.Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>
</form>
