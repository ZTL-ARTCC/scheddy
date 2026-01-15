<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import CalendarCheck2 from '@lucide/svelte/icons/calendar-check-2';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const timeofday = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'morning';
		if (hour < 17) return 'afternoon';
		return 'evening';
	});
</script>

<h1 class="text-4xl font-extrabold mb-8">Good {timeofday}, {data.user.firstName}</h1>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	<Card.Root class="transition-all hover:shadow-md">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3">
			<Card.Title class="text-base font-semibold">Your upcoming sessions</Card.Title>
			<div class="p-2 bg-primary/10 rounded-full">
				<CalendarCheck2 class="size-5 text-primary" />
			</div>
		</Card.Header>
		<Card.Content>
			<div class="text-4xl font-bold tracking-tighter">{data.yourSessions}</div>
			<div class="mt-4">
				<a
					href="/dash/mentors/{data.user.id}"
					class="group inline-flex items-center text-sm font-medium text-primary transition-colors"
				>
					Your schedule
					<ChevronRight class="ml-1 size-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="transition-all hover:shadow-md">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3">
			<Card.Title class="text-base font-semibold">Total scheduled sessions</Card.Title>
			<div class="p-2 bg-primary/10 rounded-full">
				<CalendarCheck2 class="size-5 text-primary" />
			</div>
		</Card.Header>
		<Card.Content>
			<div class="text-4xl font-bold tracking-tighter">{data.upcoming}</div>
			<div class="mt-4">
				<a
					href="/dash/cal"
					class="group inline-flex items-center text-sm font-medium text-primary transition-colors"
				>
					View calendar
					<ChevronRight class="ml-1 size-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="transition-all hover:shadow-md">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3">
			<Card.Title class="text-base font-semibold">Pending transfer requests</Card.Title>
			<div class="p-2 bg-primary/10 rounded-full">
				<ArrowUpDown class="size-5 text-primary" />
			</div>
		</Card.Header>
		<Card.Content>
			<div class="text-4xl font-bold tracking-tighter">{data.transferRequests}</div>
			<div class="mt-4">
				<a
					href="/dash/cal/transfer-requests"
					class="group inline-flex items-center text-sm font-medium text-primary transition-colors"
				>
					View transfer requests
					<ChevronRight class="ml-1 size-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
