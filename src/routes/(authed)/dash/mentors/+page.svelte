<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { mentorsCols } from './columns';
	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<p class="ml-1">
	Mentors and instructors are added automatically by their VATUSA role. You can also
	<a class="text-blue-500 hover:text-blue-600 transition font-semibold" href="/dash/users"
		>override a user's role &rarr;</a
	>
</p>

<DataTable class="max-w-4xl" data={data.users} columns={mentorsCols} />
