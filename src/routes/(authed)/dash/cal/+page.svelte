<script lang="ts">
	import type { PageData } from './$types';
	import { columns } from './columns';
	import DataTable from '$lib/ui/DataTable.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<DataTable class="w-full" data={data.mentorSessions} {columns} />
