<script lang="ts">
	import { DateTime } from 'luxon';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Button from '$lib/components/ui/button/button.svelte';
	import ButtonGroup from '$lib/components/ui/button-group/button-group.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import CalendarItem from './CalendarItem.svelte';
	import type { PageData } from '../$types';
	import Plus from '@lucide/svelte/icons/plus';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const today = DateTime.now();
	let selectedDay = $state(DateTime.now());
	let selectedWeekStart = $derived.by(() =>
		selectedDay.minus({ days: selectedDay.weekday % 7 }).startOf('day')
	);
	let selectedWeekEnd = $derived.by(() => selectedWeekStart.plus({ days: 6 }).endOf('day'));
	let view = $state('week');
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
						></div>
					{/each}
				{/each}
			</div>
		</ScrollArea>
	</div>
</div>
