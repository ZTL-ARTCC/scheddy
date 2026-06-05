<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns, type CalendarItem } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4 p-4">
	<h3 class="text-md">
		<a class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold" href="/schedule">
			&larr; Back to Scheduling
		</a>
	</h3>
	<h2 class="font-semibold text-lg">Your Upcoming Sessions as a Student</h2>
	<DataTable class="w-full" data={data.upcomingSessions as unknown as CalendarItem[]} {columns} />
</div>
