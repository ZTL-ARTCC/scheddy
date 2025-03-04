<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	async function cancel() {
		await fetch('?/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		await goto(`/dash/mentors/${data.sessionInfo.mentor.id}`);
		toast.success('Session cancelled successfully!');
		await invalidateAll();
	}
</script>

<h2 class="text-xl font-semibold">Cancel Session</h2>

<p>
	Are you sure you wish to cancel? It is your responsibility to inform the student of the
	cancellation.
</p>

<div class="flex flex-row flex-wrap gap-2">
	<Button
		onclick={() => {
			goto(`/dash/sessions/${data.sessionInfo.session.id}`);
		}}
		variant="outline">Nevermind</Button
	>
	<Button onclick={cancel} variant="destructive">Yes, I'm sure</Button>
</div>
