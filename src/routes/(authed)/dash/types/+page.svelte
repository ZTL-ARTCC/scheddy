<script lang="ts">
	import type { PageData } from './$types';
	import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';
	import Button from '$lib/ui/Button.svelte';
	import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-svelte';
	import Modal from '$lib/ui/modal/Modal.svelte';
	import ModalHeader from '$lib/ui/modal/ModalHeader.svelte';
	import ModalBody from '$lib/ui/modal/ModalBody.svelte';
	import ModalFooter from '$lib/ui/modal/ModalFooter.svelte';
	import CreateForm from './CreateForm.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { RATINGS } from '$lib/utils';
	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let categories = $derived.by(() => {
		let c: Record<string, PageData['types']> = {};
		for (let t of data.types) {
			if (t && t.category) {
				if (!Object.keys(c).includes(t.category)) {
					c[t.category] = [];
				}
				c[t.category].push(t);
			}
		}
		return c;
	});

	let createOpen = $state(false);
	let deleteOpen = $state(false);
	let deleteId: string | null = $state(null);
	async function del() {
		if (!deleteId) return;
		let params = new URLSearchParams();
		params.set('id', deleteId);
		await fetch('?/remove', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		});
		await invalidateAll();
		deleteOpen = false;
		deleteId = null;
	}
</script>

<div class="relative overflow-x-auto shadow-md rounded mt-2">
	<TableRoot>
		<TableHead>
			<TableHeadColumn>Type</TableHeadColumn>
			<TableHeadColumn>Duration (minutes)</TableHeadColumn>
			<TableHeadColumn>Rating</TableHeadColumn>
			<TableHeadColumn>
				<div class="flex flex-row align-middle justify-between items-center">
					<span>Actions</span>
					<Button
						onclick={() => {
							createOpen = true;
						}}
						variant="tableCreateAction"
					>
						<PlusIcon class="w-4 h-4 mr-2" />
						Add/Update
					</Button>
				</div>
			</TableHeadColumn>
		</TableHead>
		<TableBody>
			{#each Object.entries(categories) as [k, v]}
				<TableRow>
					<TableColumn><i>{k}</i></TableColumn>
					<TableColumn />
					<TableColumn />
				</TableRow>
				{#each v as type}
					<TableRow>
						<TableColumn><span class="ml-2">{type.name}</span></TableColumn>
						<TableColumn>{type.length} minutes</TableColumn>
						<TableColumn>
							{Object.entries(RATINGS).find(([_, v]) => v === type.rating)?.[0]}
						</TableColumn>
						<TableColumn>
							<div class="flex flex-row gap-x-4">
								<Button
									onclick={() => {
										deleteId = type.id;
										deleteOpen = true;
									}}
									variant="danger"
									size="icon"
								>
									<TrashIcon class="w-4 h-4" />
								</Button>
								<Button
									onclick={() => {
										goto(`types/edit/${type.id}`);
									}}
									size="icon"
								>
									<PencilIcon class="w-4 h-4" />
								</Button>
							</div>
						</TableColumn>
					</TableRow>
				{/each}
			{/each}
		</TableBody>
	</TableRoot>
</div>

<Modal
	onclose={() => {
		createOpen = false;
	}}
	bind:open={createOpen}
>
	<ModalHeader
		onclose={() => {
			createOpen = false;
		}}
		title="Create session type"
	/>
	<ModalBody>
		<CreateForm
			onsuccess={() => {
				createOpen = false;
			}}
			oncancel={() => {
				createOpen = false;
			}}
			update={false}
			data={data.createForm}
		/>
	</ModalBody>
</Modal>

<Modal
	onclose={() => {
		deleteOpen = false;
	}}
	bind:open={deleteOpen}
>
	<ModalHeader
		onclose={() => {
			deleteOpen = false;
		}}
		title="Confirm type removal"
	/>
	<ModalBody>
		<div class="px-4">
			<p class="text-red-500">
				** ALL SESSIONS booked under this session type will be removed! This cannot be undone! **
			</p>
		</div>
	</ModalBody>
	<ModalFooter>
		<Button
			onclick={() => {
				deleteOpen = false;
			}}
			variant="ghost"
			size="sm">Cancel</Button
		>
		<Button onclick={del} variant="danger" size="sm">Remove</Button>
	</ModalFooter>
</Modal>
