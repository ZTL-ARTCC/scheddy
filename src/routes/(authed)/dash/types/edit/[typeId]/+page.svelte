<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import CreateForm from '../../CreateForm.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="mx-auto max-w-md justify-start">
	<CreateForm
		onsuccess={() => {
			goto('/dash/types');
		}}
		oncancel={() => {
			goto('/dash/types');
		}}
		update={true}
		data={data.sType}
	/>
</div>