<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { version } from '$app/environment';
	import { HeartIcon, LoaderCircle } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { DateTime, Interval } from 'luxon';
	import { roleOf } from '$lib';
	import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
	import { clientConfig } from '$lib/config/client';
	import { Button } from '$lib/components/ui/button';

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
	<Card.Root class="max-w-xl mx-4 text-center px-4 py-2">
		<Card.Header>
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
			{#if done}
				<p>{$message}</p>
			{:else if !data.atMaxSessions}
				<form class="text-left flex flex-col gap-4" method="POST" use:enhance>
					<div class={data.reschedule ? 'hidden' : ''}>
						<!-- Step 1: Always shown - session type -->
						<Form.Field {form} name="sessionType">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Session Type</Form.Label>
									<Select.Root type="single" bind:value={$formData.sessionType} name={props.name}>
										<Select.Trigger {...props}>
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
										<Select.Trigger {...props}>
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
										<Select.Trigger {...props}>
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

					<!-- Step 3: Submit button -->
					<div class="flex flex-row gap-4">
						{#if data.reschedule}
							<Button href="/schedule/cancel/{data.oldId}" class="flex-1" variant="ghost"
								>Cancel Session</Button
							>
						{/if}
						{#if $formData.slot && $formData.slot !== ''}
							<Form.Button class="flex-2">
								{#if $delayed}
									<LoaderCircle class="w-4 h-4 animate-spin" />
								{:else}
									{data.reschedule ? 'Reschedule' : 'Schedule'} &rarr;
								{/if}
							</Form.Button>
						{/if}
					</div>
				</form>
			{:else}
				<p>
					You have reached your facility's limit for maximum booked sessions. Contact your training
					staff if you believe this to be in error.
				</p>
			{/if}
		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground justify-center flex flex-col gap-2">
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

			<a
				target="_blank"
				href="https://github.com/ZTL-ARTCC/scheddy"
				class="hover:underline underline-offset-4"
				>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
			>
		</Card.Footer>
	</Card.Root>
</div>
