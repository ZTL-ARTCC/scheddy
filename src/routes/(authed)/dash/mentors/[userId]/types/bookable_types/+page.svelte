<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { toast } from 'svelte-sonner';
	import { Switch } from '$lib/components/ui/switch';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/mentors/${data.mentor.id}`);
				toast.success('Session types bookable by students types updated successfully!');
			}
		}
	});
	const { form: formData, delayed, enhance } = form;
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-semibold mb-2">
		Editing session types bookable by students - {data.mentor.firstName}
		{data.mentor.lastName}
	</h1>

	<form method="POST" use:enhance>
		<div class="flex flex-col gap-3">
			{#each Object.entries(data.typesMap) as [id, name]}
				<Form.Field {form} name={id}>
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center space-x-2">
								<Switch {...props} bind:checked={$formData.allowed[id]} />
								<Form.Label>{name}</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/each}
			<Form.Button class="w-1/5 mr-auto">
				{#if $delayed}
					<LoaderCircleIcon class="size-4 animate-spin" />
				{:else}
					Update
				{/if}
			</Form.Button>
		</div>
	</form>
</div>
