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
	import Button from '$lib/ui/Button.svelte';
	import { PencilIcon } from 'lucide-svelte';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

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
		<DataTable data={data.upcomingSessions} {columns} />
	</div>