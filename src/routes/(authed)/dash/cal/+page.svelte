<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';
	import Button from '$lib/ui/Button.svelte';
	import { roleOf } from '$lib';
	import { ROLE_STAFF } from '$lib/utils';
	import { PencilIcon } from 'lucide-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="relative overflow-x-auto shadow-md rounded mt-2">
	<TableRoot>
		<TableHead>
			<TableHeadColumn>Date</TableHeadColumn>
			<TableHeadColumn>Session Type</TableHeadColumn>
			<TableHeadColumn>Student</TableHeadColumn>
			<TableHeadColumn>Mentor</TableHeadColumn>
			<TableHeadColumn>
				<div class="flex flex-row align-middle justify-between items-center">
					<span>Actions</span>
				</div>
			</TableHeadColumn>
		</TableHead>
		<TableBody>
			{#each data.mentorSessions as sess}
				{@const date = DateTime.fromISO(sess.session.start)}
				<TableRow>
					<TableColumn>
						{#if data.user.timezone}
							{date.setZone(data.user.timezone).toLocaleString(DateTime.DATETIME_FULL)}
						{:else}
							{date.toLocaleString(DateTime.DATETIME_FULL)}
						{/if}
					</TableColumn>
					<TableColumn>{data.typesMap[sess.session.type]}</TableColumn>
					<TableColumn>{sess.student.firstName} {sess.student.lastName}</TableColumn>
					<TableColumn>{sess.mentor.firstName} {sess.mentor.lastName}</TableColumn>
					<TableColumn>
						{#if roleOf(data.user) >= ROLE_STAFF || sess.mentor.id == data.user.id}
							<Button size="icon" href="/dash/sessions/{sess.session.id}">
								<PencilIcon class="w-4 h-4" />
							</Button>
						{/if}
					</TableColumn>
				</TableRow>
			{/each}
		</TableBody>
	</TableRoot>
</div>
<a class="text-sm text-blue-500 hover:text-blue-600 transition font-semibold" href="/dash/cal/old"
	>View historical sessions &rarr;</a
>
