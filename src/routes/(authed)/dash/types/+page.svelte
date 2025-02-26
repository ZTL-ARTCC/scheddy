<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { stColumns } from './columns';
	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<DataTable class="max-w-4xl" data={data.types} columns={stColumns} />