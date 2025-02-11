<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
  import TableRoot from '$lib/ui/table/TableRoot.svelte';
	import TableHead from '$lib/ui/table/TableHead.svelte';
	import TableHeadColumn from '$lib/ui/table/TableHeadColumn.svelte';
	import TableBody from '$lib/ui/table/TableBody.svelte';
	import TableRow from '$lib/ui/table/TableRow.svelte';
	import TableColumn from '$lib/ui/table/TableColumn.svelte';
	import { PencilIcon } from 'lucide-svelte';
	import Button from '$lib/ui/Button.svelte';

  interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">{data.user.firstName} {data.user.lastName}</h1>

	<h2 class="font-semibold text-lg">Your Upcoming Sessions as a Student</h2>

  <div class="relative overflow-x-auto shadow-md rounded mt-2">
    <TableRoot>
      <TableHead>
        <TableHeadColumn>Date</TableHeadColumn>
        <TableHeadColumn>Session Type</TableHeadColumn>
        <TableHeadColumn>Mentor</TableHeadColumn>
        <TableHeadColumn>
          <div class="flex flex-row align-middle justify-between items-center">
            <span>Actions</span>
          </div>
        </TableHeadColumn>
      </TableHead>
      <TableBody>
        {#each data.upcomingSessions as sess}
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
            <TableColumn>{sess.mentor.firstName} {sess.mentor.lastName}</TableColumn>
            <TableColumn>
              <Button size="icon" href="/dash/sessions/{sess.session.id}">
                <PencilIcon class="w-4 h-4" />
              </Button>
            </TableColumn>
          </TableRow>
        {/each}
      </TableBody>
    </TableRoot>
  </div>
</div>
