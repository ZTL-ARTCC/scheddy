<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { version } from '$app/environment';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { goto, invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { DateTime, Interval } from 'luxon';
	import { roleOf } from '$lib';
	import { ROLE_MENTOR, ROLE_STAFF } from '$lib/utils';
	import { clientConfig } from '$lib/config/client';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { slide } from 'svelte/transition';
	import { fade } from 'svelte/transition';
	import Globe from '@lucide/svelte/icons/globe';
	import Clock from '@lucide/svelte/icons/clock';
	import Calendar from '@lucide/svelte/icons/calendar';

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

<div
	class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center bg-muted/20"
>
	<Card.Root class="max-w-xl mx-4 text-center px-4 py-2">
		<Card.Header>
			<div class="flex justify-between mb-3">
				<div class="flex items-center gap-2">
					<p class="text-xs text-muted-foreground font-medium">
						Logged in as <span class="text-foreground"
							>{data.user.firstName} {data.user.lastName}</span
						>
						<span class="mx-1 opacity-50">•</span>
						<span class="text-[10px] uppercase tracking-wider">{data.role}</span>
					</p>
				</div>
				<button
					onclick={logout}
					class="text-xs font-semibold text-muted-foreground hover:text-red-700 hover:cursor-pointer transition-colors flex items-center gap-1"
				>
					<span>Logout</span>
					<LogOut class="size-3" />
				</button>
			</div>
			<Card.Title class="text-2xl font-extrabold">
				Schedule appointment at <span class="text-primary">{clientConfig.facility.name_public}</span
				>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.blocked}
				<div class="space-y-1 my-6">
					<p class="text-lg font-bold">Scheduling Blocked</p>
					<p class="text-sm">
						You have been blocked from scheduling sessions. Contact your training staff for more
						information.
					</p>
				</div>
			{:else if done}
				<p>{$message}</p>
			{:else if data.atMaxSessions}
				<div class="space-y-1 my-6">
					<p class="text-lg font-bold">Session Limit Reached</p>
					<p class="text-sm">
						You have reached your facility's limit for maximum booked sessions. Contact your
						training staff if you believe this to be in error.
					</p>
				</div>
			{:else if data.cooldown}
				<div class="space-y-1 my-6">
					<p class="text-lg font-bold">Scheduling Cooldown Active</p>
					<p class="text-sm">
						You have recently booked a session and are currently in a scheduling cooldown period.
						Please wait <span class="italic font-bold">{data.cooldownRemaining}</span> before booking
						another session.
					</p>
				</div>
			{:else}
				<form class="flex flex-col gap-6" method="POST" use:enhance>
					<div class="space-y-2">
						<Form.Field {form} name="sessionType">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="flex items-center justify-start text-base font-bold">
										1. Select Session Type
									</Form.Label>
									<Select.Root type="single" bind:value={$formData.sessionType} name={props.name}>
										<Select.Trigger {...props} class="h-12 border-2 focus:ring-primary">
											{#if $formData.sessionType && data.sessionMap[$formData.sessionType]}
												<div class="flex items-center gap-2">
													<Clock class="size-4 text-muted-foreground" />
													<span class="font-semibold"
														>{data.sessionMap[$formData.sessionType].name}</span
													>
													<span class="text-muted-foreground"
														>({data.sessionMap[$formData.sessionType].length}m)</span
													>
												</div>
											{:else}
												Select a session type...
											{/if}
										</Select.Trigger>
										<Select.Content>
											{#each data.categories as category}
												<Select.Group>
													<Select.GroupHeading>{category.category}</Select.GroupHeading>
													{#each category.items as item}
														<Select.Item value={item.id} label={item.name}>
															<div class="flex flex-col">
																<span class="font-medium">{item.name}</span>
																<span class="text-xs text-muted-foreground"
																	>{item.length} minutes</span
																>
															</div>
														</Select.Item>
													{/each}
												</Select.Group>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					{#if $formData.sessionType && $formData.sessionType !== ''}
						{@const slots = data.slotData[$formData.sessionType]}

						<div transition:slide={{ duration: 300 }} class="space-y-6 pt-6 border-t border-dashed">
							<Form.Field {form} name="timezone">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2 mb-2">
											<Globe class="size-4 text-muted-foreground" />
											<Form.Label class="text-sm font-semibold text-muted-foreground"
												>Adjust Timezone</Form.Label
											>
										</div>
										<Select.Root type="single" bind:value={$formData.timezone} name={props.name}>
											{@const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone}
											<Select.Trigger {...props} class="bg-muted/30">
												{#if $formData.timezone}
													<span class="flex items-center gap-2">
														{$formData.timezone}
														{#if $formData.timezone === defaultTz}
															<span
																class="text-[10px] font-bold uppercase tracking-tight text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-0.5"
															>
																Local
															</span>
														{/if}
													</span>
												{:else}
													<span class="text-muted-foreground italic">Select your timezone...</span>
												{/if}
											</Select.Trigger>
											<Select.Content>
												{#each data.timezones as timezone}
													<Select.Item value={timezone.name} label={timezone.name}>
														<span class="flex items-center gap-2">
															{timezone.name}
															{#if timezone.name === defaultTz}
																<span
																	class="text-[10px] font-bold uppercase tracking-tight text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-0.5"
																>
																	Local
																</span>
															{/if}
														</span>
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<Form.Field {form} name="slot">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="flex items-center justify-start text-base font-bold">
											2. Select Available Slot
										</Form.Label>

										<Select.Root type="single" bind:value={$formData.slot} name={props.name}>
											<Select.Trigger {...props} class="h-12 border-2 focus:ring-primary">
												{#if $formData.slot}
													<div class="flex items-center gap-2">
														<Calendar class="size-4 text-muted-foreground" />
														<span class="font-semibold text-foreground">
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
														</span>
													</div>
												{:else}
													Select an available slot...
												{/if}
											</Select.Trigger>

											<Select.Content class="max-h-80 shadow-xl border-2">
												{#each slots as slot}
													{@const interval = Interval.fromISO(slot.slot)}
													{#if interval.start}
														{@const label = interval.start
															.setZone($formData.timezone)
															.toLocaleString(DateTime.DATETIME_FULL)}
														<Select.Item
															value="{slot.slot}@{slot.mentor}"
															{label}
															class="py-3 cursor-pointer focus:bg-primary focus:text-primary-foreground"
														>
															{label}
														</Select.Item>
													{/if}
												{:else}
													<Select.Item
														value="__invalid__"
														disabled
														label="No slots available :("
														class="text-muted-foreground opacity-50 italic"
													>
														No slots available :(
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors class="font-semibold text-destructive" />
							</Form.Field>
						</div>
						{#if $formData.slot}
							<div transition:fade class="pt-4">
								<Form.Button class="w-full h-12 text-lg font-bold shadow-lg hover:cursor-pointer">
									{#if $delayed}
										<LoaderCircle class="mr-2 size-5 animate-spin" />
										Scheduling...
									{:else}
										Confirm Appointment &rarr;
									{/if}
								</Form.Button>
								<p class="mt-3 text-center text-xs text-muted-foreground italic">
									A confirmation email will be sent upon booking.
								</p>
							</div>
						{/if}
					{/if}
				</form>
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
				href="https://github.com/ZTL-ARTCC/scheddy"
				target="_blank"
				rel="noreferrer"
				class="group inline-flex items-center gap-1.5 transition-colors hover:text-primary font-medium"
			>
				<span class="font-bold tracking-tighter">scheddy</span>
				<span class="text-muted-foreground/50">v{version}</span>
				<span class="mx-1 h-3 w-[1px] bg-muted-foreground/20"></span>
				<span class="flex items-center gap-1">
					Built with
					<HeartIcon class="size-3  fill-red-500 text-red-500" />
					by vZTL
				</span>
			</a>
		</Card.Footer>
	</Card.Root>
</div>
