<script lang="ts">
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/sessions/${data.sessionId}`);
				toast.success('Session transfer request sent!');
			}
		}
	});
	const { form: formData, enhance, delayed } = form;
</script>

<h2 class="text-xl font-semibold">Transfer Session</h2>

<form class="flex flex-col max-w-sm gap-4" method="POST" use:enhance>
	<UserSelector
		label="Mentor"
		{form}
		usersMap={data.usersMap}
		name="newMentor"
		bind:value={$formData.newMentor}
	/>

	<Form.Button disabled={$formData.newMentor == 0}>
		{#if $delayed}
			<LoaderCircleIcon class="animate-spin size-4" />
		{:else}
			Send Transfer Request
		{/if}
	</Form.Button>
</form>
