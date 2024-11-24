<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import { PencilIcon } from 'lucide-svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import Button from '$lib/ui/Button.svelte';
	import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">{data.mentor.firstName} {data.mentor.lastName}</h1>

	<h2 class="font-semibold text-lg">Upcoming Sessions</h2>
	<!--
	<ul class="list-disc list-inside">
		{#each data.mentorSessions as sess}
			<li>,  with </li>
		{:else}
			<p>No upcoming sessions for this mentor</p>
		{/each}
	</ul>

	-->

	<div class="relative overflow-x-auto shadow-md rounded mt-2">
		<TableRoot>
			<TableHead>
				<TableHeadColumn>Date</TableHeadColumn>
				<TableHeadColumn>Session Type</TableHeadColumn>
				<TableHeadColumn>Student</TableHeadColumn>
				<TableHeadColumn>
					<div class="flex flex-row align-middle justify-between items-center">
						<span>Actions</span>
					</div>
				</TableHeadColumn>
			</TableHead>
			<TableBody>
				{#each data.mentorSessions as sess}
					<TableRow>
						<TableColumn
							>{DateTime.fromISO(sess.session.start)
								.setZone(data.mentor.timezone)
								.toLocaleString(DateTime.DATETIME_FULL)}</TableColumn
						>
						<TableColumn>{data.typesMap[sess.session.type]}</TableColumn>
						<TableColumn>{sess.user.firstName} {sess.user.lastName}</TableColumn>
						<TableColumn>
							<Button size="icon" href="/dash/sessions/{sess.session.id}">
								<PencilIcon class="w-4 h-4" />
							</Button>
						</TableColumn>
					</TableRow>
				{/each}
			</TableBody>
		</TableRoot>
	</div>

	<h2 class="font-semibold text-lg">
		Availability
		<a
			class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold"
			href="/dash/mentors/{data.mentor.id}/availability">Update availability &rarr;</a
		>
	</h2>
	<p class="text-sm text-slate-500">
		Timezone: {data.mentor.timezone ? data.mentor.timezone : 'Not set'}
	</p>
	{#if data.mentor.mentorAvailability && data.availability}
		<table>
			<thead class="text-left">
				<tr>
					<th>Day</th>
					<th>Availability</th>
				</tr>
			</thead>
			<tbody>
				{#each ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as day}
					{@const key = day.toLowerCase()}
					<tr>
						<td>{day}</td>
						{#if data.availability[key].available}
							<td>
								{data.availability[key].start.hour.toString().padStart(2, '0')}:{data.availability[
									key
								].start.minute
									.toString()
									.padStart(2, '0')}
								&rarr;
								{data.availability[key].end.hour.toString().padStart(2, '0')}:{data.availability[
									key
								].end.minute
									.toString()
									.padStart(2, '0')}
							</td>
						{:else}
							<td>Unavailable</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>

		<p>Exceptions:</p>
		{#if data.availability && data.availability.exceptions}
			{#each Object.entries(data.availability.exceptions) as [date, exc]}
				<p>
					<b>{date}:</b>
					{#if exc && exc.available}
						{exc.start.hour.toString().padStart(2, '0')}:{exc.start.minute
							.toString()
							.padStart(2, '0')} -> {exc.end.hour.toString().padStart(2, '0')}:{exc.end.minute
							.toString()
							.padStart(2, '0')}
					{:else}
						Not available
					{/if}
				</p>
			{:else}
				<p>None</p>
			{/each}
		{:else}
			<p>None</p>
		{/if}
	{:else}
		<p>No availability set at this time</p>
	{/if}

	<h2 class="font-semibold text-lg">
		Allowed Session Types
		<a
			class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold"
			href="/dash/mentors/{data.mentor.id}/types">Update allowed types &rarr;</a
		>
	</h2>
	{#if data.allowedTypes}
		<ul class="list-disc list-inside">
			{#each data.allowedTypes as typ}
				<li>{data.typesMap[typ]}</li>
			{:else}
				<i>This mentor is not able to teach any sessions.</i>
			{/each}
		</ul>
	{:else}
		<i>This mentor is not able to teach any sessions.</i>
	{/if}
</div>
