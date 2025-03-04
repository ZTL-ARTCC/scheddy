<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { roleOf } from '$lib';
	import { page } from '$app/state';
	import { ROLE_STAFF } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	interface Props {
		id: string;
		mentorId: number;
	}
	let { id, mentorId }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
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
					toast.success('Copied session ID to clipboard.');
				}}
			>
				Copy session ID
			</DropdownMenu.Item>
			{#if roleOf(page.data.user) >= ROLE_STAFF || mentorId === page.data.user.id}
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a href="/dash/sessions/{id}" {...props}> Edit </a>
					{/snippet}
				</DropdownMenu.Item>
			{/if}
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				<a href="/schedule?sessionId={id}">Cancel/Reschedule</a>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
