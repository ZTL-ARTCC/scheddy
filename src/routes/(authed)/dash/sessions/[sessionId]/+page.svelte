<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import Button from '$lib/ui/Button.svelte';
	import ModalHeader from '$lib/ui/modal/ModalHeader.svelte';
	import Modal from '$lib/ui/modal/Modal.svelte';
	import ModalBody from '$lib/ui/modal/ModalBody.svelte';
	import ModalFooter from '$lib/ui/modal/ModalFooter.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import Input from '$lib/ui/form/Input.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let cancelOpen = $state(false);
	let rescheduleOpen = $state(false);

	let date: string = $state('');
	let hour: number = $state(0);
	let minute: number = $state(0);

	function check_time(t: string) {
		const start_time = DateTime.fromISO(t);
		const now = DateTime.now();
		const interval = start_time.diff(now, 'hours');

		if (interval.hours < 24) {
			return false;
		} else {
			return true;
		}
	}

	async function cancel() {
		await fetch('?/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		await goto('/dash');
		await invalidateAll();
	}

	function reschedule_helper() {
		if (!data.isMentor) {
			rescheduleOpen = true;
		} else {
			const queryParam = new URLSearchParams();
			queryParam.set('sessionId', data.sessionInfo.session.id);
			queryParam.set('reschedule', 'true');
			queryParam.set('type', data.sessionInfo.sessionType.id);
			goto(`/schedule?${queryParam.toString()}`);
		}
	}

	async function reschedule() {
		let udata = new URLSearchParams();

		console.log(date);

		let [ys, ms, ds] = date.split('-');
		let y = Number.parseInt(ys);
		let m = Number.parseInt(ms);
		let d = Number.parseInt(ds);

		let datetime = DateTime.now().setZone(data.sessionInfo.mentor.timezone).set({
			year: y,
			month: m,
			day: d,
			hour: hour,
			minute: minute,
			second: 0,
			millisecond: 0
		});

		udata.set('date', datetime.toISO()!);
		await fetch('?/reschedule', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: udata.toString()
		});

		await invalidateAll();
		rescheduleOpen = false;
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">
		Session - {data.sessionInfo.sessionType.name} at {DateTime.fromISO(
			data.sessionInfo.session.start
		).toLocaleString(DateTime.DATETIME_HUGE)} for {data.sessionInfo.student.firstName}
		{data.sessionInfo.student.lastName}
	</h1>
	<p>
		<b>Student:</b>
		{data.sessionInfo.student.firstName}
		{data.sessionInfo.student.lastName} ({data.sessionInfo.student.id})
	</p>
	<p>
		<b>Mentor:</b>
		{data.sessionInfo.mentor.firstName}
		{data.sessionInfo.mentor.lastName} ({data.sessionInfo.mentor.id})
	</p>
	<p>
		<b>Date:</b>
		{DateTime.fromISO(data.sessionInfo.session.start).toLocaleString(DateTime.DATETIME_HUGE)}
	</p>
	<p>
		<b>Session Type:</b>
		{data.sessionInfo.sessionType.category} - {data.sessionInfo.sessionType.name}
	</p>
	<p><b>Duration:</b> {data.sessionInfo.sessionType.length} minutes</p>
	{#if data.isMentor || check_time(data.sessionInfo.session.start)}
		<h2 class="font-bold text-lg">Session Actions</h2>
		<div>
			<Button
				onclick={() => {
					cancelOpen = true;
				}}
				variant="danger"
			>
				Cancel
			</Button>
			<Button
				onclick={reschedule_helper}
				variant="danger"
			>
				Reschedule
			</Button>
		</div>
	{:else}
		<p class="text-red-500">
			You cannot cancel or reschedule this session as it is less than 24 hours away. Please contact
			your instructor if you need to cancel or reschedule.
		</p>
	{/if}
</div>

{#if data.isMentor || check_time(data.sessionInfo.session.start)}
	<Modal
		onclose={() => {
			cancelOpen = false;
		}}
		bind:open={cancelOpen}
	>
		<ModalHeader
			onclose={() => {
				cancelOpen = false;
			}}
			title="Confirm cancellation"
		/>
		{#if data.isMentor}
			<ModalBody>
				<div class="px-4">
					<p class="text-red-500">
						It is your responsibility to inform the student of the cancellation.
					</p>
				</div>
			</ModalBody>
		{/if}
		<ModalFooter>
			<Button
				onclick={() => {
					cancelOpen = false;
				}}
				variant="ghost"
				size="sm">Nevermind</Button
			>
			<Button onclick={cancel} variant="danger" size="sm">Yes, cancel</Button>
		</ModalFooter>
	</Modal>
	<Modal
		onclose={() => {
			rescheduleOpen = false;
		}}
		bind:open={rescheduleOpen}
	>
		<ModalHeader
			rescheduleOpen={() => {
				rescheduleOpen = false;
			}}
			title="Reschedule"
		/>
		<ModalBody>
			<div class="px-4">
				<p>Timezone: {data.sessionInfo.mentor.timezone}</p>
				<div class="flex flex-col">
					<Input bind:value={date} label="date" type="date" />
					<div class="flex flex-row gap-4">
						<Input bind:value={hour} type="number" label="HH" />
						<Input bind:value={minute} type="number" label="MM" />
					</div>
				</div>

				<p class="text-red-500">
					It is your responsibility to inform the student of the rescheduling.
				</p>
			</div>
		</ModalBody>
		<ModalFooter>
			<Button
				onclick={() => {
					rescheduleOpen = false;
				}}
				variant="ghost"
				size="sm">Nevermind</Button
			>
			<Button onclick={reschedule} variant="danger" size="sm">Reschedule</Button>
		</ModalFooter>
	</Modal>
{/if}
