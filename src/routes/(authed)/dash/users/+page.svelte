<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { userColumns } from './userColumns';
	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<i class="ml-1"
	>ATMs, DATMs, WMs, and TAs will not appear on this list, as their access is granted automatically
	by their VATUSA role.</i
>

<DataTable class="max-w-5xl" columns={userColumns} data={data.users} />
