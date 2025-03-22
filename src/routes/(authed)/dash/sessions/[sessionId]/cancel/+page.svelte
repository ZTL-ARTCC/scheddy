<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let reason: string | null = $state(null);

	async function cancel() {
		let udata = new URLSearchParams();
		if (reason) {
			udata.set('reason', reason);
		}

		await fetch('?/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: udata.toString()
		});
		await goto(`/dash/mentors/${data.sessionInfo.mentor.id}`);
		toast.success('Session cancelled successfully!');
		await invalidateAll();
	}
</script>

<h2 class="text-xl font-semibold">Cancel Session</h2>

<!-- Debating on whether to remove now that cancelation emails have been implemented -->
<p>
	Are you sure you wish to cancel? It is your responsibility to inform the student of the
	cancellation.
</p>

<Input placeholder="Reason... (optional)" class="w-1/2" bind:value={reason}></Input>

<div class="flex flex-row flex-wrap gap-2">
	<Button
		onclick={() => {
			goto(`/dash/sessions/${data.sessionInfo.session.id}`);
		}}
		variant="outline">Nevermind</Button
	>
	<Button onclick={cancel} variant="destructive">Yes, I'm sure</Button>
</div>
