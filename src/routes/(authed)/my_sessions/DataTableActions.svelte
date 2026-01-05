<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { roleOf } from '$lib';
	import { page } from '$app/state';
	import { ROLE_STAFF } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import Copy from '@lucide/svelte/icons/copy';
	import Pencil from '@lucide/svelte/icons/pencil';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';

	interface Props {
		id: string;
		mentorId: number;
	}
	let { id, mentorId }: Props = $props();

	function copyId() {
		navigator.clipboard.writeText(id).then(() => {
			toast.success('Session ID copied to clipboard');
		});
	}
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
	<DropdownMenu.Content align="start">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading class="text-xs text-muted-foreground">
				Session Actions
			</DropdownMenu.GroupHeading>

			<DropdownMenu.Item onclick={copyId} class="gap-2 cursor-pointer">
				<Copy class="size-3 text-muted-foreground" />
				<span>Copy ID</span>
			</DropdownMenu.Item>

			{#if roleOf(page.data.user) === ROLE_STAFF || page.data.user.id === mentorId}
				<DropdownMenu.Item class="gap-2 cursor-pointer">
					<Pencil class="size-3 text-muted-foreground" />
					<a href="/dash/sessions/{id}" class="text-sm">Edit Session</a>
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Item
				class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 "
			>
				<CalendarClock class="size-3" />
				<a href="/schedule/cancel/{id}" class="flex-1">Cancel</a>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
