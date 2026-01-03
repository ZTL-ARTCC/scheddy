<script lang="ts">
	import { DateTime } from 'luxon';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Button from '$lib/components/ui/button/button.svelte';
	import ButtonGroup from '$lib/components/ui/button-group/button-group.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		selectedDay: DateTime;
		selectedWeekStart: DateTime;
		selectedWeekEnd: DateTime;
		view: string;
		onViewChange: (newView: string) => void;
		onSelectedDayChange: (newDay: DateTime) => void;
	}

	let {
		selectedDay,
		selectedWeekStart,
		selectedWeekEnd,
		view,
		onViewChange,
		onSelectedDayChange,
		class: className,
		...restProps
	}: Props = $props();

	const previous = () => {
		const newDay =
			view === 'week' ? selectedDay.minus({ days: 7 }) : selectedDay.minus({ days: 1 });
		onSelectedDayChange?.(newDay);
	};

	const next = () => {
		const newDay = view === 'week' ? selectedDay.plus({ days: 7 }) : selectedDay.plus({ days: 1 });
		onSelectedDayChange?.(newDay);
	};

	const today = () => {
		onSelectedDayChange?.(DateTime.now());
	};

	const changeView = (newView: string) => {
		onViewChange?.(newView);
	};
</script>

<div
	class={cn('flex w-full items-center justify-between border-b px-6 py-4', className)}
	{...restProps}
>
	<div class="flex flex-col">
		<h1 class="text-base font-semibold">
			{#if view === 'week'}
				{selectedWeekStart.monthShort}
				{selectedWeekStart.day} - {selectedWeekEnd.monthShort}
				{selectedWeekEnd.day},
				{selectedWeekEnd.year}
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
				<DropdownMenu.Item class="cursor-pointer" onclick={() => changeView('day')}>
					Day
				</DropdownMenu.Item>
				<DropdownMenu.Item class="cursor-pointer" onclick={() => changeView('week')}>
					Week
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<ButtonGroup>
			<Button class="hover:cursor-pointer" variant="outline" onclick={previous}>
				<ChevronLeft />
			</Button>
			<Button class="hover:cursor-pointer" variant="outline" onclick={today}>Today</Button>
			<Button class="hover:cursor-pointer" variant="outline" onclick={next}>
				<ChevronRight />
			</Button>
		</ButtonGroup>

		<a class={cn(buttonVariants({ variant: 'default' }))} href="/dash/sessions/create">
			Create Session <Plus class="size-4" />
		</a>
	</div>
</div>
