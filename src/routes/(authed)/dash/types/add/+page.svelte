<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { LoaderCircle } from 'lucide-svelte';
	import { ratingIdDisplay, RATINGS } from '$lib/utils';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/types');
				toast.success('Session type added!');
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<form class="max-w-3xl" method="POST" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="category">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Category</Form.Label>
				<Input {...props} bind:value={$formData.category} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="length">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Length (Minutes)</Form.Label>
				<Input {...props} type="number" bind:value={$formData.length} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="order">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ordering (lowest first)</Form.Label>
				<Input {...props} type="number" bind:value={$formData.order} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="rating">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Required Rating</Form.Label>
				<Select.Root type="single" bind:value={$formData.rating} name={props.name}>
					<Select.Trigger {...props}>
						{$formData.rating ? ratingIdDisplay($formData.rating) : 'Select a required rating'}
					</Select.Trigger>
					<Select.Content>
						{#each RATINGS as rating}
							<Select.Item value={rating.id} label={ratingIdDisplay(rating.id)} />
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>
			Only users with this rating or higher will be able to book this session.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="bookable" class="mb-2">
		<Form.Control>
			{#snippet children()}
				<Form.Label>Bookable</Form.Label>
				<Checkbox bind:checked={$formData.bookable} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>
		{#if $delayed}
			<LoaderCircle class="size-4 animate-spin" />
		{:else}
			Save
		{/if}
	</Form.Button>
</form>
