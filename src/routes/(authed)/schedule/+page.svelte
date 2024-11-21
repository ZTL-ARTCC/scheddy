<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_FACILITY_NAME } from '$env/static/public';
	import Card from '$lib/ui/Card.svelte';
	import { version } from '$app/environment';
	import { HeartIcon } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import Select from '$lib/ui/form/Select.svelte';
	import Button from '$lib/ui/Button.svelte';
	import { DateTime, Interval } from 'luxon';
	import { getTimeZones } from '@vvo/tzdb';
	import Modal from '$lib/ui/modal/Modal.svelte';
	import ModalHeader from '$lib/ui/modal/ModalHeader.svelte';
	import ModalFooter from '$lib/ui/modal/ModalFooter.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	function logout() {
		document.cookie = 'scheddy_token=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/;';
		invalidateAll();
		goto('/');
	}

	let categories = $derived.by(() => {
		let c = {};
		for (let t of data.sessionTypes) {
			if (t && t.category) {
				if (!Object.keys(c).includes(t.category)) {
					c[t.category] = [];
				}
				c[t.category].push(t);
			}
		}
		return c;
	});
	let sTyps = $derived.by(() => {
		let c = {};
		for (let t of data.sessionTypes) {
			c[t.id] = t;
		}
		return c;
	});

	let sessionType: string | null = $state(data.originalSessionType);

	let timezones = $state(getTimeZones());
	timezones.sort((a, b) => {
		const nameA = a.name.toUpperCase(); // ignore upper and lowercase
		const nameB = b.name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		// names must be equal
		return 0;
	});

	let step = $state(data.originalSessionType ? 2 : 1);
	let timezone = $state(DateTime.local().zoneName);
	let timeslot: string | null = $state(null);
	let interval = $derived(timeslot ? Interval.fromISO(timeslot.split('@')[0]) : null);
	let start = $derived(interval ? interval.start : null);

	let twentyFourHourPolicyUnderstood = $state(false);
	let trainingOrderPolicyUnderstood = $state(false);

	let bookingState: 'success' | 'fail' | 'loading' = $state('loading');

	const bookingUrl = data.originalSessionType
		? `?/book?sessionId=${data.originalSessionId}&reschedule=true&type=${data.originalSessionType}`
		: '?/book';

	let cancelOpen = $state(false);

	function check_time(t: string) {
		const start_time = DateTime.fromISO(t);
		const now = DateTime.now();
		const interval = start_time.diff(now, 'hours');
		return interval.hours < 24;
	}

	async function cancel() {
		let udata = new URLSearchParams();
		udata.set('sessionId', data.originalSessionId);

		await fetch('?/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: udata.toString()
		});
		await goto('/dash');
		await invalidateAll();
	}

	async function book() {
		if (!timeslot) return;

		step = 4;
		bookingState = 'loading';

		let data = new URLSearchParams();
		data.set('timeslot', timeslot);
		data.set('type', sessionType!);
		data.set('timezone', timezone);

		let r = await fetch(bookingUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: data.toString()
		});
		if (r.ok) {
			bookingState = 'success';
		} else {
			await invalidateAll();
			bookingState = 'fail';
		}
	}
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card class="pt-2">
		<div>
			<p class="text-sm text-right text-slate-500">
				Logged in as {data.user.firstName}
				{data.user.lastName} ({data.role}) -
				<button onclick={logout} class="hover:underline" href="/">Log out</button>
			</p>

			<h1 class="mt-1 font-bold text-2xl text-center">
				Schedule appointment at {PUBLIC_FACILITY_NAME}
			</h1>

			<div class="text-left mt-3 mb-6 flex flex-col gap-4 justify-center">
				{#if step === 1}
					<Select bind:value={sessionType} label="Session Type">
						{#each Object.entries(categories) as [k, v]}
							<optgroup label={k}>
								{#each v as typ}
									<option value={typ.id}>{typ.name} ({typ.length} minutes)</option>
								{/each}
							</optgroup>
						{/each}
					</Select>
					{#if sessionType !== null}
						<Button
							onclick={() => {
								step = 2;
							}}
						>
							Next
						</Button>
						{#if data.originalSessionType}
							<Button
								onclick={() => {
									cancelOpen = true;
								}}
								variant="danger"
							>
								Cancel
							</Button>
						{/if}
					{/if}
				{:else if step === 2}
					<Select name="timezone" bind:value={timezone} label="Timezone">
						{#each timezones as tz}
							<option value={tz.name}>{tz.name} ({tz.alternativeName})</option>
						{/each}
					</Select>
					{#if sessionType}
						<Select name="slot" bind:value={timeslot} label="Session Date/Time">
							{#each data.slotData[sessionType] as slot}
								<option value="{slot.slot}@{slot.mentor}"
									>{Interval.fromISO(slot.slot)
										.start.setZone(timezone)
										.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)} - {sTyps[sessionType]
										.length} minutes</option
								>
							{:else}
								<option disabled>No slots available :( Check back another time</option>
							{/each}
						</Select>
					{/if}
					<div class="flex flex-row justify-center gap-4 flex-grow">
						<Button
							class="flex-1"
							variant="ghost"
							onclick={() => {
								step = 1;
							}}
						>
							Back
						</Button>
						{#if timeslot !== null}
							<Button
								class="flex-1"
								onclick={() => {
									step = 3;
								}}
							>
								Next
							</Button>
						{/if}
					</div>
				{:else if step === 3}
					<p><b>Session type:</b> {sTyps[sessionType].name}</p>
					<p><b>Timezone:</b> {timezone}</p>
					<p>
						<b>Start time:</b>
						{start.setZone(timezone).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}
					</p>
					<p><b>Duration:</b> {sTyps[sessionType].length} minutes</p>

					<div class="flex flex-row gap-2 align-baseline">
						<input
							class="w-6 h-6 border-blue-500 ring-blue-500 rounded bg-transparent"
							id="24h"
							type="checkbox"
							bind:checked={twentyFourHourPolicyUnderstood}
						/>
						<label for="24h"
							>I understand that I need to contact my mentor to make changes within 24 hours</label
						>
					</div>
					<div class="flex flex-row gap-2 align-baseline">
						<input
							class="w-6 h-6 border-blue-500 ring-blue-500 rounded bg-transparent"
							id="trainingOrder"
							type="checkbox"
							bind:checked={trainingOrderPolicyUnderstood}
						/>
						<label for="trainingOrder">I have read and understood the training order</label>
					</div>

					<div class="flex flex-row justify-center gap-4 flex-grow">
						<Button
							class="flex-1"
							variant="ghost"
							onclick={() => {
								step = 2;
							}}
						>
							Back
						</Button>
						{#if twentyFourHourPolicyUnderstood && trainingOrderPolicyUnderstood}
							<Button onclick={book} class="flex-1">Schedule</Button>
						{/if}
					</div>
				{:else if step === 4}
					{#if bookingState === 'loading'}
						<p>Booking your session, please wait...</p>
					{:else if bookingState === 'success'}
						<p>
							Session booked 🥳 You'll receive a confirmation email shortly and you should see the
							session on your dashboard soon.
						</p>
					{:else}
						<p>
							Couldn't book the session :( There may have been a network error or someone else may
							have booked this slot.
						</p>
						<Button
							class="flex-1"
							variant="ghost"
							onclick={() => {
								step = 1;
								timeslot = null;
								trainingOrderPolicyUnderstood = false;
								twentyFourHourPolicyUnderstood = false;
							}}
						>
							Try again
						</Button>
					{/if}
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-row gap-3 justify-center">
				{#if data.isTrainer}
					<a
						href="/dash/mentors/{data.user.id}"
						class="block hover:underline text-sm text-blue-500 font-semibold">My Schedule</a
					>
				{/if}
				{#if data.isStaff}
					<a href="/dash" class="block hover:underline text-sm text-blue-500 font-semibold"
						>Administration</a
					>
				{/if}
			</div>
			<a
				target="_blank"
				href="https://github.com/ZTL-ARTCC/scheddy"
				class="block hover:underline text-sm text-slate-500"
				>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
			>
		</div>
	</Card>
	{#if data.originalSessionType && check_time(timeslot)}
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
	{/if}
</div>
