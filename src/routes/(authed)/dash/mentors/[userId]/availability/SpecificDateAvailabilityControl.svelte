<script lang="ts">
	import type { AvailSchema } from './availSchema';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import type { DayOfWeek } from '$lib/utils';

	interface Props {
		dayId: DayOfWeek;
		form: SuperForm<Infer<AvailSchema>>;
	}
	let { dayId, form }: Props = $props();

	const { form: formData } = $derived(form);

	function pad() {
		$formData.exceptions[dayId].slots.forEach((slot) => {
			slot.start.hour = Number(String(slot.start.hour).padStart(2, '0'));
			slot.start.minute = Number(String(slot.start.minute).padStart(2, '0'));
			slot.end.hour = Number(String(slot.end.hour).padStart(2, '0'));
			slot.end.minute = Number(String(slot.end.minute).padStart(2, '0'));
		});
	}
</script>

<div class="rounded-md border p-4">
	<Form.Field
		{form}
		name="exceptions.{dayId}.available"
		class="flex flex-row items-start space-x-3 space-y-0"
	>
		<Form.Control>
			{#snippet children({ props })}
				<Checkbox onblur={pad} {...props} bind:checked={$formData.exceptions[dayId].available} />
				<div class="flex-1 leading-none flex flex-row justify-between mt-0.5">
					<Form.Label>{dayId}</Form.Label>
					<Button
						onclick={() => {
							delete $formData.exceptions[dayId];
							$formData.exceptions = $formData.exceptions;
						}}
						class="float-right h-min text-sm text-destructive p-0"
						variant="link"
					>
						remove &rarr;
					</Button>
				</div>
				<input name={props.name} value={$formData.exceptions[dayId].available} hidden />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if $formData.exceptions[dayId].available}
		<div class="flex flex-col gap-2">
			<div class="flex flex-row gap-4 ml-7 mt-2">
				<div class="flex flex-row gap-2">
					<Form.Field {form} name="exceptions.{dayId}.slots[0].start.hour">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>From</Form.Label>
								<Input
									onblur={pad}
									{...props}
									type="number"
									bind:value={$formData.exceptions[dayId].slots[0].start.hour}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>Hours (HH)</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<span class="mt-10">:</span>
					<Form.Field {form} name="exceptions.{dayId}.slots[0].start.minute">
						<Form.Control>
							{#snippet children({ props })}
								<!-- required for spacing. it's cursed -->
								<!-- eslint-disable-next-line no-irregular-whitespace -->
								<Form.Label>​</Form.Label>
								<Input
									onblur={pad}
									{...props}
									type="number"
									bind:value={$formData.exceptions[dayId].slots[0].start.minute}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>Minutes (MM)</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<Separator orientation="vertical" />
				<div class="flex flex-row gap-2">
					<Form.Field {form} name="exceptions.{dayId}.slots[0].end.hour">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>To</Form.Label>
								<Input
									onblur={pad}
									{...props}
									type="number"
									bind:value={$formData.exceptions[dayId].slots[0].end.hour}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>Hours (HH)</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<span class="mt-10">:</span>
					<Form.Field {form} name="exceptions.{dayId}.slots[0].end.minute">
						<Form.Control>
							{#snippet children({ props })}
								<!-- required for spacing. it's cursed -->
								<!-- eslint-disable-next-line no-irregular-whitespace -->
								<Form.Label>​</Form.Label>
								<Input
									onblur={pad}
									{...props}
									type="number"
									bind:value={$formData.exceptions[dayId].slots[0].end.minute}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>Minutes (MM)</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="mt-6">
					<Button variant="destructive" disabled size="icon">
						<TrashIcon class="w-4 h-4" />
					</Button>
				</div>
			</div>
			<Form.Field {form} name="exceptions.{dayId}.slots[0].available" class="ml-7 mb-4">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex items-center space-x-2">
							<Checkbox {...props} bind:checked={$formData.exceptions[dayId].slots[0].available} />
							<Form.Label>Available</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>
		{#each $formData.exceptions[dayId].slots as slot, i}
			{#if i > 0}
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-4 ml-7 mt-2">
						<div class="flex flex-row gap-2">
							<Form.Field {form} name="exceptions.{dayId}.slots[{i}].start.hour">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>From</Form.Label>
										<Input onblur={pad} {...props} type="number" bind:value={slot.start.hour} />
									{/snippet}
								</Form.Control>
								<Form.Description>Hours (HH)</Form.Description>
								<Form.FieldErrors />
							</Form.Field>
							<span class="mt-10">:</span>
							<Form.Field {form} name="exceptions.{dayId}.slots[{i}].start.minute">
								<Form.Control>
									{#snippet children({ props })}
										<!-- required for spacing. it's cursed -->
										<!-- eslint-disable-next-line no-irregular-whitespace -->
										<Form.Label>​</Form.Label>
										<Input onblur={pad} {...props} type="number" bind:value={slot.start.minute} />
									{/snippet}
								</Form.Control>
								<Form.Description>Minutes (MM)</Form.Description>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<Separator orientation="vertical" />
						<div class="flex flex-row gap-2">
							<Form.Field {form} name="exceptions.{dayId}.slots[{i}].end.hour">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>To</Form.Label>
										<Input onblur={pad} {...props} type="number" bind:value={slot.end.hour} />
									{/snippet}
								</Form.Control>
								<Form.Description>Hours (HH)</Form.Description>
								<Form.FieldErrors />
							</Form.Field>
							<span class="mt-10">:</span>
							<Form.Field {form} name="exceptions.{dayId}.slots[{i}].end.minute">
								<Form.Control>
									{#snippet children({ props })}
										<!-- required for spacing. it's cursed -->
										<!-- eslint-disable-next-line no-irregular-whitespace -->
										<Form.Label>​</Form.Label>
										<Input onblur={pad} {...props} type="number" bind:value={slot.end.minute} />
									{/snippet}
								</Form.Control>
								<Form.Description>Minutes (MM)</Form.Description>
								<Form.FieldErrors />
							</Form.Field>
						</div>
						<div class="mt-6">
							<Button
								onclick={() => {
									$formData.exceptions[dayId].slots.splice(i);
									$formData.exceptions[dayId].slots = $formData.exceptions[dayId].slots;
								}}
								variant="destructive"
								size="icon"
							>
								<TrashIcon class="w-4 h-4" />
							</Button>
						</div>
					</div>
					<Form.Field {form} name="exceptions.{dayId}.slots[{i}].available" class="ml-7 mb-4">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center space-x-2">
									<Checkbox
										{...props}
										bind:checked={$formData.exceptions[dayId].slots[i].available}
									/>
									<Form.Label>Available</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
					</Form.Field>
				</div>
			{/if}
		{/each}

		<div class="ml-7">
			<Button
				variant="outline"
				onclick={() => {
					$formData.exceptions[dayId].slots.push({
						available: false,
						start: { hour: 0, minute: 0 },
						end: { hour: 0, minute: 0 }
					});
					$formData.exceptions[dayId].slots = $formData.exceptions[dayId].slots;
				}}
			>
				<PlusIcon class="w-4 h-4 mr-2" />
				Add Another Slot
			</Button>
		</div>

		<div class="ml-7">
			<span class="text-xs text-muted-foreground"
				>You can add times such as 25:00 to extend availability past midnight. Times to be entered
				in 24-hour notation, <b>local time in {$formData.timezone}.</b></span
			>
		</div>
	{/if}
</div>
