<script lang="ts">
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { CreateSchema } from './createSchema';
	import Button from '$lib/ui/Button.svelte';
	import ModalFooter from '$lib/ui/modal/ModalFooter.svelte';
	import { RATINGS } from '$lib/utils';
	import { CogIcon } from 'lucide-svelte';
	import Input from '$lib/ui/form/Input.svelte';
	import Select from '$lib/ui/form/Select.svelte';

	interface Props {
		update: boolean;
		data: SuperValidated<Infer<CreateSchema>>;
		oncancel: () => void;
		onsuccess: () => void;
	}
	let { update, data, oncancel, onsuccess }: Props = $props();

	const { form, delayed, errors, constraints, enhance } = superForm(data, {
		async onUpdated({ form }) {
			if (form.valid) {
				onsuccess();
			}
		}
	});
</script>

<form method="POST" action={update ? '?/update' : '?/create'} use:enhance>
	<div class="px-4 flex flex-col text-left gap-4">
		<Input
			label="Name"
			{...$constraints.name}
			bind:value={$form.name}
			name="name"
			error={$errors.name}
		/>
		<Input
			label="Duration (Minutes)"
			{...$constraints.duration}
			bind:value={$form.duration}
			name="duration"
			type="number"
			error={$errors.duration}
		/>
		<Input
			label="Category"
			{...$constraints.category}
			bind:value={$form.category}
			name="category"
			error={$errors.category}
		/>
		<Input
			label="Order"
			{...$constraints.order}
			bind:value={$form.order}
			name="order"
			type="number"
			error={$errors.order}
		/>
		<Select
			label="Rating"
			{...$constraints.rating}
			bind:value={$form.rating}
			name="rating"
			type="number"
			error={$errors.rating}
		>
			{#each Object.entries(RATINGS) as [k, v]}
				<option value={v}>{k}</option>
			{/each}
		</Select>
	</div>

	<ModalFooter>
		<Button onclick={oncancel} variant="ghost" size="sm" class="w-1/2">Cancel</Button>
		<Button variant="formSubmit" size="sm" class="w-1/2">
			{#if $delayed}
				<CogIcon class="w-6 h-6 inline animate-spin" />
			{:else if update}
				Update
			{:else}
				Create
			{/if}
		</Button>
	</ModalFooter>
</form>
