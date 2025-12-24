<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let id: number = 0;
	let open = false;

	async function add() {
		let data = new URLSearchParams();
		data.set('id', id.toString());
		await fetch('?/add', {
			method: 'POST',
			body: data.toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		await invalidateAll();
		toast.success('Added block!');
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="float-right {buttonVariants({ size: 'sm' })}">
		<PlusIcon class="size-4 mr-2" />
		Add Blocked User
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add blocked user</Dialog.Title>
			<Dialog.Description>This user will be barred from booking new sessions.</Dialog.Description>
		</Dialog.Header>

		<Label for="cid">CID</Label>
		<Input id="cid" placeholder="CID" bind:value={id} />

		<Dialog.Footer>
			<Button type="submit" onclick={add}>Add</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
