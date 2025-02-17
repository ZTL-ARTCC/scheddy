<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_FACILITY_NAME } from '$env/static/public';
	import { DateTime } from 'luxon';
	import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-col">
	<div
		class="bg-slate-800 min-h-14 h-14 min-w-screen flex flex-row items-center px-6 pt-3 pb-4 justify-between border-b border-slate-900"
	>
		<h2 class="hidden md:block font-bold">{PUBLIC_FACILITY_NAME}</h2>
		<p class="font-semibold">Hello, {data.user.firstName} {data.user.lastName} ({data.role})</p>
	</div>
	<div class="flex flex-col gap-4 p-4">
		<h3 class="text-md">
			<a
				class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold"
				href="/schedule"
			>
				&larr; Back to Scheduling
			</a>
		</h3>
		<h2 class="font-semibold text-lg">Your Upcoming Sessions as a Student</h2>
		<div class="relative overflow-x-auto shadow-md rounded mt-2">
			<TableRoot>
				<TableHead>
					<TableHeadColumn>Date</TableHeadColumn>
					<TableHeadColumn>Session Type</TableHeadColumn>
					<TableHeadColumn>Mentor</TableHeadColumn>
				</TableHead>
				<TableBody>
					{#each data.upcomingSessions as sess}
						{@const date = DateTime.fromISO(sess.session.start)}
						<TableRow>
							<TableColumn>
								{#if data.user.timezone}
									{date.setZone(data.user.timezone).toLocaleString(DateTime.DATETIME_FULL)}
								{:else}
									{date.toLocaleString(DateTime.DATETIME_FULL)}
								{/if}
							</TableColumn>
							<TableColumn>{data.typesMap[sess.session.type]}</TableColumn>
							<TableColumn>{sess.mentor.firstName} {sess.mentor.lastName}</TableColumn>
						</TableRow>
					{/each}
				</TableBody>
			</TableRoot>
		</div>
	</div>
</div>
