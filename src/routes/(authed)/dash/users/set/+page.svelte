<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { ROLE_DEVELOPER, ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT, roleString } from '$lib/utils.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
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
				toast.success('Role override set successfully!');
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<form class="max-w-md" method="POST" use:enhance>
	<UserSelector label="User" {form} usersMap={data.usersMap} name="id" bind:value={$formData.id} />
	<Form.Field {form} name="roleOverride">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Role Override</Form.Label>
				<Select.Root type="single" bind:value={$formData.roleOverride} name={props.name}>
					<Select.Trigger {...props}>
						{$formData.roleOverride
							? roleString($formData.roleOverride)
							: 'Select an override role for this user'}
					</Select.Trigger>
					<Select.Content>
						{#each [ROLE_STUDENT, ROLE_MENTOR, ROLE_STAFF, ROLE_DEVELOPER] as role}
							<Select.Item value={role.toString()} label={roleString(role)} />
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>
			The override will only take effect if higher than the user's existing role.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>
		{#if $delayed}
			<LoaderCircleIcon class="size-4 animate-spin" />
		{:else}
			Set
		{/if}
	</Form.Button>
</form>
