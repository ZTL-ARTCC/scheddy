<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import CalendarCheck2 from '@lucide/svelte/icons/calendar-check-2';
	import TowerControlIcon from '@lucide/svelte/icons/tower-control';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let time = $state(new Date());
	let hours = $derived(time.getHours());
	let timeofday = $derived.by(() => {
		// 4am-12: morning
		// 12-5: afternoon
		// 5+: evening
		if (hours >= 4 && hours <= 12) {
			return 'morning';
		} else if (hours >= 12 && hours <= 17) {
			return 'afternoon';
		} else {
			return 'evening';
		}
	});
</script>

<h1 class="text-2xl font-semibold">Good {timeofday}, {data.user.firstName}</h1>

<div class="grid gap-2 md:grid-cols-2 mr-auto">
	<Card.Root class="min-w-xs grow md:grow-0">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-1">
			<Card.Title class="text-sm font-medium">Your upcoming sessions</Card.Title>
			<CalendarCheck2 class="w-4 h-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content class="px-6 pb-6 pt-4">
			<div class="text-2xl font-bold">{data.yourSessions}</div>
			<a
				href="/dash/mentors/{data.user.id}"
				class="text-muted-foreground text-xs hover:underline underline-offset-4"
				>Your schedule &rarr;</a
			>
		</Card.Content>
	</Card.Root>
	<Card.Root class="min-w-xs grow md:grow-0">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-1">
			<Card.Title class="text-sm font-medium">Facility total upcoming sessions</Card.Title>
			<TowerControlIcon class="w-4 h-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content class="px-6 pb-6 pt-4">
			<div class="text-2xl font-bold">{data.upcoming}</div>
			<a href="/dash/cal" class="text-muted-foreground text-xs hover:underline underline-offset-4"
				>Facility calendar &rarr;</a
			>
		</Card.Content>
	</Card.Root>
	<Card.Root class="min-w-xs grow md:grow-0">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-1">
			<Card.Title class="text-sm font-medium">Pending session transfer requests</Card.Title>
			<ArrowUpDown class="w-4 h-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content class="px-6 pb-6 pt-4">
			<div class="text-2xl font-bold">{data.transferRequests}</div>
			<a
				href="/dash/cal/transfer-requests"
				class="text-muted-foreground text-xs hover:underline underline-offset-4"
				>Transfer Requests &rarr;</a
			>
		</Card.Content>
	</Card.Root>
</div>
