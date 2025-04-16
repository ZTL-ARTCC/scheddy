<script lang="ts">
	import { tick } from 'svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import * as Form from '$lib/components/ui/form';
	import { buttonVariants } from '$lib/components/ui/button';
	import { ChevronsUpDown } from 'lucide-svelte';
	import Check from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils';
	import { computeCommandScore, useId } from 'bits-ui';

	interface Props {
		usersMap: Record<number, string>;
		form: never;
		name: string;
		value: string;
		label: string;
	}
	let { usersMap, form, name, label, value = $bindable('') }: Props = $props();

	function customFilter(commandValue: string, search: string, commandKeywords?: string[]): number {
		const defaultScore = computeCommandScore(commandValue, search, commandKeywords);
		const parsedUserName = usersMap[Number.parseInt(commandValue)];

		let nameScore = 0;

		if (parsedUserName) {
			nameScore = computeCommandScore(parsedUserName, search, commandKeywords);
		}

		// Add custom logic here
		return Math.max(defaultScore, nameScore);
	}

	let open = $state(false);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const triggerId = useId();
</script>

<Form.Field {form} {name} class="flex flex-col">
	<Popover.Root bind:open>
		<Form.Control id={triggerId}>
			{#snippet children({ props })}
				<Form.Label>{label}</Form.Label>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'max-w-md justify-between',
						!value && 'text-muted-foreground'
					)}
					role="combobox"
					{...props}
				>
					{usersMap[value] ? usersMap[value] + ' (' + value + ')' : 'Select user'}
					<ChevronsUpDown class="opacity-50" />
				</Popover.Trigger>
				<input hidden {value} name={props.name} />
			{/snippet}
		</Form.Control>
		<Popover.Content class="p-0 max-w-lg">
			<Command.Root filter={customFilter}>
				<Command.Input autofocus placeholder="Search users..." class="h-9" />
				<Command.Empty>No language found.</Command.Empty>
				<Command.Group>
					{#each Object.entries(usersMap) as [cid, name]}
						<Command.Item
							value={cid}
							onSelect={() => {
								value = cid;
								closeAndFocusTrigger(triggerId);
							}}
						>
							{name} ({cid})
							<Check class={cn(cid !== value && 'text-transparent')} />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
	<Form.FieldErrors />
</Form.Field>
