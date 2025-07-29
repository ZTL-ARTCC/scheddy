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
	>The following users will be barred from booking new sessions:</i
>

<DataTable class="max-w-5xl" columns={userColumns} data={data.users} />
