<script lang="ts">
	import type { PageData } from './$types';
	import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';
	import Button from '$lib/ui/Button.svelte';
	import { PencilIcon } from 'lucide-svelte';
	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<p class="ml-1">
	Mentors and instructors are added automatically by their VATUSA role. Mentors available on at
	least one day are indicated by a green circle. You can also
	<a class="text-blue-500 hover:text-blue-600 transition font-semibold" href="/dash/users"
		>override a user's role &rarr;</a
	>
</p>

<div class="relative overflow-x-auto shadow-md rounded mt-2">
	<TableRoot>
		<TableHead>
			<TableHeadColumn>Mentor</TableHeadColumn>
			<TableHeadColumn>
				<div class="flex flex-row align-middle justify-between items-center">
					<span>Actions</span>
				</div>
			</TableHeadColumn>
		</TableHead>
		<TableBody>
			{#each data.users as user}
				<TableRow>
					<TableColumn scope="row" class="font-medium whitespace-nowrap text-white">
						<span>{user.firstName} {user.lastName}</span>
						{#if user.isVisitor}
							<span class="bg-yellow-500 text-yellow-950 rounded-full py-1 px-3">Visitor</span>
						{/if}
						{#if user.isAvailable}
							<span class="text-xs text-green-600">&#11044</span>
						{:else}
							<span class="text-xs text-red-600">&#11044</span>
						{/if}
					</TableColumn>
					<TableColumn>
						<Button size="icon" href="/dash/mentors/{user.id}">
							<PencilIcon class="w-4 h-4" />
						</Button>
					</TableColumn>
				</TableRow>
			{/each}
		</TableBody>
	</TableRoot>
</div>
