<script lang="ts">
	import { DateTime } from 'luxon';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Button from '$lib/components/ui/button/button.svelte';
	import ButtonGroup from '$lib/components/ui/button-group/button-group.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import type { PageData } from '../$types';
	import Plus from '@lucide/svelte/icons/plus';
	import { goto } from '$app/navigation';
	import { cn, ROLE_STAFF } from '$lib/utils';
	import { roleOf } from '$lib';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const backgroundColors = [
		'#991b1b',
		'#9a3412',
		'#92400e',
		'#854d0e',
		'#3f6212',
		'#166534',
		'#065f46',
		'#115e59',
		'#155e75',
		'#075985',
		'#1e40af',
		'#3730a3',
		'#5b21b6',
		'#6b21a8',
		'#86198f',
		'#9d174d',
		'#9f1239'
	];

	const today = DateTime.now();
	let selectedDay = $state(DateTime.now());
	let selectedWeekStart = $derived.by(() =>
		selectedDay.minus({ days: selectedDay.weekday % 7 }).startOf('day')
	);
	let selectedWeekEnd = $derived.by(() => selectedWeekStart.plus({ days: 6 }).endOf('day'));
	let view = $state('week');

	const findHeight = (start: DateTime, end: DateTime) => {
		const diffMinutes = end.diff(start, 'minutes').minutes;
		return diffMinutes * 0.1;
	};

	const findMargin = (start: DateTime) => {
		let minutes = start.minute;
		if (minutes > 30) {
			minutes = minutes - 30;
		}
		return (minutes / 30) * 12;
	};

	const isCompact = (start: DateTime, end: DateTime, min: number) => {
		const minutes = end.diff(start, 'minutes').minutes;
		return minutes <= min;
	};
</script>

<div class="flex flex-col w-full h-full border-2 rounded-xl">
	<!-- Header -->
	<div class="flex w-full items-center justify-between border-b px-6 py-4">
		<div class="flex flex-col">
			<h1 class="text-base font-semibold">
				{#if view === 'week'}
					{selectedWeekStart.monthShort}
					{selectedWeekStart.day} - {selectedWeekEnd.monthShort}
					{selectedWeekEnd.day}, {selectedWeekEnd.year}
				{:else}
					{selectedDay.monthLong} {selectedDay.day}, {selectedDay.year}
				{/if}
			</h1>
		</div>
		<div class="flex items-center gap-5">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" class="hover:cursor-pointer">
						<span>{view === 'day' ? 'Day' : 'Week'}</span>
						<ChevronsUpDown class="size-4 mt-0.5 ml-1 opacity-50" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center">
					<DropdownMenu.Item class="cursor-pointer" onclick={() => (view = 'day')}>
						Day
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer" onclick={() => (view = 'week')}>
						Week
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<ButtonGroup>
				<Button
					class="hover:cursor-pointer"
					variant="outline"
					onclick={() => {
						selectedDay = selectedDay.minus({ days: view === 'week' ? 7 : 1 });
					}}><ChevronLeft /></Button
				>
				<Button
					class="hover:cursor-pointer"
					variant="outline"
					onclick={() => {
						selectedDay = DateTime.now();
					}}
				>
					Today
				</Button>
				<Button
					class="hover:cursor-pointer"
					variant="outline"
					onclick={() => {
						selectedDay = selectedDay.plus({ days: view === 'week' ? 7 : 1 });
					}}><ChevronRight /></Button
				>
			</ButtonGroup>
			<Button class="hover:cursor-pointer" onclick={() => goto('/dash/sessions/create')}>
				Create Session <Plus class="size-4" />
			</Button>
		</div>
	</div>
	<div class="flex flex-col w-full rounded-b-xl overflow-hidden">
		<div
			class="grid w-full border-b text-center font-semibold text-sm"
			class:grid-cols-29={view === 'week'}
			class:grid-cols-4={view === 'day'}
		>
			{#if view === 'week'}
				<div class="border-r"></div>
				{#each Array(7) as _, i}
					<div
						class="col-span-4 flex flex-col items-center justify-center py-3 text-sm"
						class:border-r={i !== 6}
						class:bg-muted={selectedWeekStart.plus({ days: i }).hasSame(today, 'day')}
					>
						<span class="uppercase tracking-wider text-xs text-muted-foreground">
							{selectedWeekStart.plus({ days: i }).weekdayShort}
						</span>
						<span class="text-base font-semibold">
							{selectedWeekStart.plus({ days: i }).day}
						</span>
					</div>
				{/each}
			{:else if view === 'day'}
				<div class="col-span-4 flex flex-col items-center justify-center py-3 text-sm">
					<span class="uppercase tracking-wider text-xs text-muted-foreground">
						{selectedDay.weekdayLong}
					</span>
					<span class="text-base font-semibold">{selectedDay.day}</span>
				</div>
			{/if}
		</div>

		<ScrollArea>
			<div
				class="grid flex-1"
				class:grid-cols-29={view === 'week'}
				class:grid-cols-4={view === 'day'}
			>
				{#each Array(48) as _, hour}
					<div class="border-r" class:border-b={hour < 47} class:border-b-dashed={hour % 2 === 0}>
						{#if hour % 2 === 0}
							<div class="text-xs text-muted-foreground text-center">
								{DateTime.fromObject({ hour: hour / 2, minute: 0 }).toFormat('h a')}
							</div>
						{/if}
					</div>
					{#each Array(view === 'week' ? 7 : 1) as _, day}
						<div
							class={cn(
								'relative h-12 p-2 col-span-4',
								selectedWeekStart.plus({ days: day }).hasSame(today, 'day') && 'bg-muted/30'
							)}
							class:border-b={hour < 47}
							class:border-r={day !== (view === 'week' ? 6 : 0)}
							class:border-b-dashed={hour % 2 === 0}
						>
							{#if view === 'week'}
								{#each data.mentorSessions as session}
									{@const sessionStart = DateTime.fromISO(session.session.start)}
									{@const sessionEnd = sessionStart.plus({ minutes: session.sessionType.length })}

									{#if sessionStart.hasSame(selectedWeekStart.plus( { days: day } ), 'day') && sessionStart.hour === Math.floor(hour / 2) && Math.floor(sessionStart.minute / 30) * 30 === (hour % 2) * 30}
										<button
											onclick={() => {
												if (
													session.session.mentor === data.user.id ||
													roleOf(data.user) >= ROLE_STAFF
												) {
													goto(`/dash/sessions/${session.session.id}`);
												}
											}}
											class={cn(
												'absolute top-0 left-0 w-full z-10 rounded-md text-xs cursor-pointer',
												`mt-${findMargin(sessionStart)}`
											)}
											style={`height: ${findHeight(sessionStart, sessionEnd)}rem; background-color: ${
												backgroundColors[(Math.random() * backgroundColors.length) | 0]
											};`}
										>
											<div
												class={cn(
													'overflow-hidden h-full flex justify-center',
													isCompact(sessionStart, sessionEnd, 15)
														? 'flex-row items-center gap-2'
														: 'flex-col'
												)}
											>
												<p class="font-semibold">
													{session.sessionType.name}
												</p>
												<p>
													{session.student.firstName}
													{session.student.lastName}
												</p>
												<p class={`${isCompact(sessionStart, sessionEnd, 15) ? 'hidden' : ''}`}>
													{sessionStart.toFormat('h:mm a')} - {sessionEnd.toFormat('h:mm a')}
												</p>
												<p class={`${isCompact(sessionStart, sessionEnd, 45) ? 'hidden' : ''}`}>
													with {session.mentor.firstName}
													{session.mentor.lastName}
												</p>
											</div>
										</button>
									{/if}
								{/each}
							{:else}{/if}
						</div>
					{/each}
				{/each}
			</div>
		</ScrollArea>
	</div>
</div>
