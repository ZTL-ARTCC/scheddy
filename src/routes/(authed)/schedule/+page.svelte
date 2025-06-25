<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Alert from '$lib/components/ui/alert';
	import { version } from '$app/environment';
	import { HeartIcon } from '@lucide/svelte';
	import { LoaderCircle, CheckCircle2, CircleAlert } from '@lucide/svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { DateTime, Interval } from 'luxon';
	import { roleOf } from '$lib';
	import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
	import { clientConfig } from '$lib/config/client';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	function logout() {
		document.cookie = 'scheddy_token=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/;';
		invalidateAll();
		goto('/');
	}

	let done = $state(false);

	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				done = true;
			}
		}
	});
	const { form: formData, enhance, delayed, message } = form;

	$effect(() => {
		$formData.timezone = DateTime.local().zoneName;
	});
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card.Root class="max-w-xl mx-4 px-4 py-2">
		<Card.Header class="text-center">
			<p class="text-sm text-right text-slate-500 mb-1">
				Logged in as {data.user.firstName}
				{data.user.lastName} ({data.role}) -
				<button onclick={logout} class="hover:underline">Log out</button>
			</p>
			<Card.Title
				>{data.reschedule ? 'Reschedule' : 'Schedule'} appointment at {clientConfig.facility
					.name_public}</Card.Title
			>
		</Card.Header>
		<Card.Content>
			{#if data.reschedule && !data.canReschedule}
				{@const start = DateTime.fromISO(data.oldSession.start)}
				{@const diff = Math.floor(start.diffNow().as('hours'))}
				<Alert.Root variant="destructive">
					<CircleAlert class="size-4" />
					<Alert.Title>Too late to make changes</Alert.Title>
					<Alert.Description>
						Your session is in {diff} hour{diff === 1 ? '' : 's'}. Please contact your mentor to reschedule.
					</Alert.Description>
				</Alert.Root>
			{:else if done}
				{#if $message.result === 'success'}
					<Alert.Root class="border-green-50 bg-green-50 text-green-900 dark:border-green-950 dark:bg-green-950/20 dark:text-green-700">
						<CheckCircle2 />
						<Alert.Title>Session {data.reschedule ? 'rescheduled' : 'booked'} 🥳</Alert.Title>
						<Alert.Description>You'll receive a confirmation email shortly and you should see the session on your dashboard soon.</Alert.Description>
					</Alert.Root>
				{:else}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Could not book session</Alert.Title>
						<Alert.Description>{$message.message}</Alert.Description>
					</Alert.Root>
				{/if}
			{:else if !data.atMaxSessions}
				<form class="text-left flex flex-col gap-4" method="POST" use:enhance>
					<div class="{data.reschedule ? 'hidden' : ''}">
						<!-- Step 1: Always shown - session type -->
						<Form.Field {form} name="sessionType">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Session Type</Form.Label>
									<Select.Root type="single" bind:value={$formData.sessionType} name={props.name}>
										<Select.Trigger class="w-full" {...props}>
											{$formData.sessionType && data.sessionMap[$formData.sessionType]
												? `${data.sessionMap[$formData.sessionType].name} (${data.sessionMap[$formData.sessionType].length} minutes)`
												: 'Select a session type'}
										</Select.Trigger>
										<Select.Content>
											{#each data.categories as category}
												<Select.Group>
													<Select.GroupHeading>{category.category}</Select.GroupHeading>
													{#each category.items as item}
														{@const label = `${item.name} (${item.length} minutes)`}
														<Select.Item value={item.id} {label}>{label}</Select.Item>
													{/each}
												</Select.Group>
											{:else}
												<Select.Item
													disabled
													value="_invalid_"
													label="No session types are available at the moment :("
												/>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<!-- Step 2: Shown after specifying type - select slot -->
					{#if $formData.sessionType && $formData.sessionType !== ''}
						<Form.Field {form} name="timezone">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Timezone</Form.Label>
									<Select.Root type="single" bind:value={$formData.timezone} name={props.name}>
										<Select.Trigger class="w-full" {...props}>
											{$formData.timezone ? $formData.timezone : 'Select a timezone'}
										</Select.Trigger>
										<Select.Content>
											{#each data.timezones as timezone}
												{@const label = timezone.name}
												<Select.Item value={timezone.name} {label}>{label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						{@const slots = data.slotData[$formData.sessionType]}
						<Form.Field {form} name="slot">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{data.reschedule ? 'New date' : 'Date'} & time</Form.Label>
									<Select.Root type="single" bind:value={$formData.slot} name={props.name}>
										<Select.Trigger class="w-full" {...props}>
											{#if $formData.slot}
												{#each slots as slot}
													{#if `${slot.slot}@${slot.mentor}` === $formData.slot}
														{@const interval = Interval.fromISO(slot.slot)}
														{#if interval.start}
															{interval.start
																.setZone($formData.timezone)
																.toLocaleString(DateTime.DATETIME_FULL)}
														{/if}
													{/if}
												{/each}
											{:else}
												Select a {data.reschedule ? 'new' : ''} time and date
											{/if}
										</Select.Trigger>
										<Select.Content>
											{#each slots as slot}
												{@const interval = Interval.fromISO(slot.slot)}
												{#if interval.start}
													{@const label = interval.start
														.setZone($formData.timezone)
														.toLocaleString(DateTime.DATETIME_FULL)}
													<Select.Item value="{slot.slot}@{slot.mentor}" {label}
														>{label}</Select.Item
													>
												{/if}
											{:else}
												<Select.Item value="__invalid__" disabled label="No slots available :("
													>No slots available :(</Select.Item
												>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					{/if}

					{#if data.reschedule && !($formData.slot && $formData.slot !== '')}
						<div class="flex flex-row gap-2 w-full">
							<Separator class="shrink align-middle mt-2" />
							<p class="text-muted-foreground text-xs align-middle">or</p>
							<Separator class="shrink align-middle mt-2" />
						</div>
					{/if}

					<!-- Step 3: Submit button -->
					{#if data.reschedule || $formData.slot && $formData.slot !== ''}
					<div class="flex flex-row gap-4">
						{#if $formData.slot && $formData.slot !== ''}
							<Form.Button class="flex-2">
								{#if $delayed}
									<LoaderCircle class="w-4 h-4 animate-spin" />
								{:else}
									{data.reschedule ? 'Reschedule' : 'Schedule'} &rarr;
								{/if}
							</Form.Button>
						{:else if data.reschedule}
							<Button href="/schedule/cancel/{data.oldId}" class="flex-1" variant="outline"
							>Cancel Session</Button
							>
						{/if}
					</div>
						{/if}
				</form>
			{:else}
				<p class="text-center">
					You have reached your facility's limit for maximum booked sessions. Contact your training
					staff if you believe this to be in error.
				</p>
			{/if}


		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground justify-center flex flex-col gap-2">
			<div class="flex flex-col">
				{#if data.reschedule}
					<span class="text-xs text-muted-foreground">Modifying session #{data.oldSession.id}</span>
				{/if}
				<div class="flex flex-row gap-4 text-primary font-semibold">
					<a class="hover:underline underline-offset-4" href="/my_sessions">My Bookings</a>
					{#if roleOf(data.user) >= ROLE_MENTOR}
						<a class="hover:underline underline-offset-4" href="/dash/mentors/{data.user.id}"
						>My Schedule</a
						>
					{/if}
					{#if roleOf(data.user) >= ROLE_STAFF}
						<a class="hover:underline underline-offset-4" href="/dash">Administration</a>
					{/if}
				</div>
			</div>

			<a
				target="_blank"
				href="https://github.com/ZTL-ARTCC/scheddy"
				class="hover:underline underline-offset-4"
				>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
			>
		</Card.Footer>
	</Card.Root>
</div>
