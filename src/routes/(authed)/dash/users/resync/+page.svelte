<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import * as Form from '$lib/components/ui/form';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/users');
				toast.success('The user\'s role has been updated.');
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<i class="ml-1">Use this control to re-sync a user's role from VATUSA.</i>

<form class="max-w-md" method="POST" use:enhance>
	<UserSelector label="User" {form} usersMap={data.usersMap} name="id" bind:value={$formData.id} />
	<Form.Button>
		{#if $delayed}
			<LoaderCircleIcon class="size-4 animate-spin" />
		{:else}
			Sync
		{/if}
	</Form.Button>
</form>
