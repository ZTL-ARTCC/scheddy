<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="mx-auto max-w-6xl p-6">
	<div class="mb-6 flex flex-col gap-2">
		<a href="/schedule" class="text-sm font-medium text-blue-600 hover:underline transition w-fit">
			&larr; Back to Scheduling
		</a>
		<div class="flex gap-3 items-middle">
			<h2 class="text-2xl font-bold">My Upcoming Sessions</h2>
			{#if data.upcomingSessions.length > 0}
				<span class="rounded-full bg-muted p-2.5 py-1.5 text-sm">
					{data.upcomingSessions.length}
				</span>
			{/if}
		</div>
	</div>

	<div class="rounded-xl shadow-sm overflow-hidden">
		<div class="p-1">
			<DataTable data={data.upcomingSessions} {columns} />
		</div>
	</div>
</div>
