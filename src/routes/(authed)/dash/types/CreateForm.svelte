<script lang="ts">
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { CreateSchema } from './createSchema';
	import Button from '$lib/ui/Button.svelte';
	import ModalFooter from '$lib/ui/modal/ModalFooter.svelte';
	import { CogIcon } from 'lucide-svelte';
	import Input from '$lib/ui/form/Input.svelte';

	interface Props {
		data: SuperValidated<Infer<CreateSchema>>;
		oncancel: () => void;
		onsuccess: () => void;
	}
	let { data, oncancel, onsuccess }: Props = $props();

	const { form, delayed, errors, constraints, enhance } = superForm(data, {
		async onUpdated({ form }) {
			if (form.valid) {
				onsuccess();
			}
		}
	});
</script>

<form method="POST" action="?/create" use:enhance>
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
	</div>

	<ModalFooter>
		<Button onclick={oncancel} variant="ghost" size="sm">Cancel</Button>
		<Button variant="formSubmit" size="sm">
			{#if $delayed}
				<CogIcon class="w-6 h-6 inline animate-spin" />
			{:else}
				Create
			{/if}
		</Button>
	</ModalFooter>
</form>
