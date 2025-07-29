<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		id: string;
	}
	let { id }: Props = $props();

	async function remove() {
		let data = new URLSearchParams();
		data.set("id", id);
		await fetch("?/remove", {
			method: 'POST',
			body: data.toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		});
		await invalidateAll();
		toast.success('Removed block!');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0 float-right">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item
				onclick={() => {
					navigator.clipboard.writeText(id);
					toast.success('Copied CID to clipboard!');
				}}
			>
				Copy CID
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={remove}>Remove</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
