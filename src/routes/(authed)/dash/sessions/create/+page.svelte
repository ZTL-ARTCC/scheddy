<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime, Interval } from 'luxon';
	import { goto } from '$app/navigation';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { buttonVariants } from '$lib/components/ui/button';
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
	import { cn } from '$lib/utils';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import type { DayAvailability, MentorAvailability, Time } from '$lib/availability';

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
		const intervalHelper = (start: Time, end: Time) => {
			const dayAvailabilityStart = sessionStart.set({
				hour: start.hour,
				minute: start.minute - 1
			});
			const dayAvailabilityEnd = sessionEnd.set({
				hour: end.hour,
				minute: end.minute + 1
			});

			return Interval.fromDateTimes(dayAvailabilityStart, dayAvailabilityEnd);
		};

		const intervals = [intervalHelper(mentorAvailability.start, mentorAvailability.end)];

		if (mentorAvailability.extraRecords) {
			for (const record of mentorAvailability.extraRecords) {
				intervals.push(intervalHelper(record.start, record.end));
			}
		}

		return intervals.some((i) => i.contains(sessionStart) && i.contains(sessionEnd));
	};

	const calculateMentorAvailability = (sessionStart: DateTime, sessiondEnd: DateTime) => {
		const mentor = data.mentorsMap[$formData.mentor];
		if (!mentor || Object.keys(data.typesMap).length === 0) return false;

		const availability: MentorAvailability | null = mentor.availability
			? JSON.parse(mentor.availability as string)
			: null;

		if (!availability) return false;

		if (
			!availability[sessionStart.weekdayLong?.toLowerCase()].available &&
			!availability[sessiondEnd.weekdayLong?.toLowerCase()].available &&
			Object.keys(availability.exceptions).length === 0
		)
			return false;

		const startDayAvailability = availability[
			sessionStart.weekdayLong?.toLowerCase()
		] as DayAvailability;

		const endDayAvailability = availability[
			sessiondEnd.weekdayLong?.toLowerCase()
		] as DayAvailability;

		if (
			availableInterval(startDayAvailability, sessionStart, sessiondEnd) &&
			availableInterval(endDayAvailability, sessionStart, sessiondEnd)
		) {
			return true;
		} else {
			for (const exception in availability.exceptions) {
				if ($formData.date === exception) {
					return availableInterval(availability.exceptions[exception], sessionStart, sessiondEnd);
				}
			}
		}
	};

	const notInAvailability =
		"This session falls outside of this mentor's availability. Are you sure you want to create it?";
	const conflictsWithExistingSession =
		'This session falls during an existing session this mentor has booked. Are you sure you want to create it?';

	const isMentorAvailable = $derived.by(() => {
		const sessionDate = DateTime.fromISO($formData.date, {
			zone: $formData.timezone
		});

		const start = sessionDate.set({ hour: $formData.hour, minute: $formData.minute });
		const end = start.plus({ minutes: data.typesMap[$formData.type].length });

		for (const session of data.mentorSessions) {
			const sessionStart = DateTime.fromISO(session.start, {
				zone: session.timezone
			});

			const sessionEnd = sessionStart.plus({ minutes: data.typesMap[session.type].length });
			const sessionInterval = Interval.fromDateTimes(sessionStart, sessionEnd);

			if (sessionInterval.contains(start) || sessionInterval.contains(end)) {
				return { status: false, message: conflictsWithExistingSession };
			}
		}

		return { status: calculateMentorAvailability(start, end), message: notInAvailability };
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

<form class="flex flex-col gap-2 max-w-sm" method="POST" use:enhance>
	<div class="flex flex-row mb-4">
		<p class="text-sm text-muted-foreground">
			Enter all dates and times in {$formData.timezone}, where it's currently {DateTime.now()
				.setZone($formData.timezone)
				.toLocaleString(DateTime.TIME_SIMPLE)}
		</p>
		<Form.Field {form} name="timezone">
			<Form.Control>
				{#snippet children({ props })}
					<Select.Root type="single" bind:value={$formData.timezone} name={props.name}>
						<Select.Trigger {...props}>
							{$formData.timezone ? $formData.timezone : 'Select a timezone'}
						</Select.Trigger>
						<Select.Content>
							{#each data.timezones as timezone}
								{@const label = timezone.name}
								<Select.Item value={timezone.name} {label}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

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

	<UserSelector label="Student" {form} {usersMap} name="student" bind:value={$formData.student} />

	{#if isMentorAvailable.status}
		<Form.Button>
			{#if $delayed}
				<LoaderCircleIcon class="animate-spin size-4" />
			{:else}
				Create Session
			{/if}
		</Form.Button>
	{:else}
		<Form.Button type="button" onclick={() => (dialogOpen = true)} hidden={$formData.type === ''}>
			Create Session
		</Form.Button>
	{/if}

	<Dialog.Root open={dialogOpen} onOpenChange={() => (dialogOpen = !dialogOpen)}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Schedule Conflict</Dialog.Title>
				<Dialog.Description>
					{isMentorAvailable.message}
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
