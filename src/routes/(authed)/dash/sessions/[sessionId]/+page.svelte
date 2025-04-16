<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import {
		CalendarDaysIcon,
		ClockIcon,
		GraduationCapIcon,
		IdCardIcon,
		PencilIcon,
		X
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import DataDisplay from './DataDisplay.svelte';
	import { roleOf } from '$lib';
	import { ROLE_STAFF, roleString } from '$lib/utils';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	async function accept() {
		await fetch('?/accept', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		toast.success('Session accepted successfully!');
		await invalidateAll();
	}

	async function decline() {
		await fetch('?/decline', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		await goto(`/dash/mentors/${data.user.id}`);
		toast.success('Session declined successfully!');
		await invalidateAll();
	}

	async function cancel_request() {
		await fetch('?/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		toast.success('Session transfer request cancelled successfully!');
		await invalidateAll();
	}
</script>

<h2 class="text-xl font-semibold">Session Information</h2>

<table class="max-w-2xl">
	<tbody>
		<DataDisplay icon={GraduationCapIcon} label="Student">
			{data.sessionInfo.student.firstName}
			{data.sessionInfo.student.lastName}
		</DataDisplay>
		<DataDisplay icon={IdCardIcon} label="Mentor">
			{data.sessionInfo.mentor.firstName}
			{data.sessionInfo.mentor.lastName}
		</DataDisplay>
		<DataDisplay icon={CalendarDaysIcon} label="Date">
			{DateTime.fromISO(data.sessionInfo.session.start).toLocaleString(DateTime.DATETIME_HUGE)}
		</DataDisplay>
		<DataDisplay icon={ClockIcon} label="Duration">
			{data.sessionInfo.sessionType.length} minutes
		</DataDisplay>
		{#if roleOf(data.user) >= ROLE_STAFF}
			<DataDisplay icon={PencilIcon} label="Created By">
				{data.createdBy}
			</DataDisplay>
			{#if data.sessionInfo.session.cancelled}
				<DataDisplay icon={X} label="Cancelled">
					{roleString(data.sessionInfo.session.cancellationUserLevel ?? 0)}:
					{data.sessionInfo.session.cancellationReason}
				</DataDisplay>
			{/if}
		{/if}
	</tbody>
</table>

<div class="flex flex-row flex-wrap gap-2">
	{#if !data.newMentor || roleOf(data.user) >= ROLE_STAFF}
		<Button href="/dash/sessions/{data.sessionInfo.session.id}/edit">Edit</Button>
		<Button href="/dash/sessions/{data.sessionInfo.session.id}/cancel" variant="destructive">
			Cancel
		</Button>
		{#if !data.pastSession && !data.pendingTransfer}
			<Button href="/dash/sessions/{data.sessionInfo.session.id}/transfer">Transfer</Button>
		{/if}
		{#if data.pendingTransfer}
			<Button onclick={cancel_request} variant="destructive">Cancel Transfer Request</Button>
		{/if}
	{/if}
	{#if data.newMentor}
		<Button onclick={accept}>Accept</Button>
		<Button onclick={decline}>Decline</Button>
	{/if}
</div>
