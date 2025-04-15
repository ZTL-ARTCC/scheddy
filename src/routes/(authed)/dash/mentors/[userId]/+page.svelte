<script lang="ts">
	import type { PageData } from './$types';
	import * as Tabs from '$lib/components/ui/tabs';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns } from './columns';
	import WeekdayAvailability from './WeekdayAvailability.svelte';
	import SpecificDateAvailability from './SpecificDateAvailability.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { ROLE_STAFF } from '$lib/utils';
	import { roleOf } from '$lib';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">{data.mentor.firstName} {data.mentor.lastName}</h1>

	<h2 class="font-semibold text-lg">Upcoming Sessions</h2>

	<DataTable class="w-full" data={data.mentorSessions} {columns} />

	<div class="flex flex-col">
		<h2 class="font-semibold text-lg">Create Session</h2>
		<p class="text-sm text-slate-500 mb-4">Create session on behalf of a student</p>
		<Button href="/dash/sessions/create" class="self-start">Create Session</Button>
	</div>

	<div class="flex flex-col">
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
	</div>
	{#if data.mentor.mentorAvailability && data.availability}
		<div class="block md:hidden">
			<Tabs.Root value="weekdays">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="weekdays">Weekday Availability</Tabs.Trigger>
					<Tabs.Trigger value="overrides">Specific Date Availability</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="weekdays">
					<WeekdayAvailability data={data.availability} />
				</Tabs.Content>
				<Tabs.Content value="overrides">
					<SpecificDateAvailability data={data.availability} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
		<div class="hidden md:flex flex-row gap-4">
			<WeekdayAvailability data={data.availability} />
			<Separator orientation="vertical" />
			<SpecificDateAvailability data={data.availability} />
		</div>
	{:else}
		<p>No availability set at this time</p>
	{/if}

	<div class="flex flex-row gap-x-4">
		<div class="flex flex-col gap-4">
			<h2 class="font-semibold text-lg">
				Allowed Session Types {#if roleOf(data.user) >= ROLE_STAFF}
					<a
						class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold"
						href="/dash/mentors/{data.mentor.id}/types/allowed_types">Update allowed types &rarr;</a
					>
				{/if}
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
		<div class="flex flex-col gap-4">
			<h2 class="font-semibold text-lg">
				Bookable By Students {#if roleOf(data.user) >= ROLE_STAFF}
					<a
						class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold"
						href="/dash/mentors/{data.mentor.id}/types/bookable_types"
						>Update bookable types &rarr;</a
					>
				{/if}
			</h2>
			{#if data.bookableTypes}
				<ul class="list-disc list-inside">
					{#each data.bookableTypes as typ}
						<li>{data.typesMap[typ]}</li>
					{:else}
						<i>This mentor is not able to be booked for any sessions.</i>
					{/each}
				</ul>
			{:else}
				<i>This mentor is not able to be booked for any sessions.</i>
			{/if}
		</div>
	</div>
</div>
