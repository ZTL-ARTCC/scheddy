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
		dayName: string;
		form: SuperForm<Infer<AvailSchema>>;
	}
	let { dayId, dayName, form }: Props = $props();

	const { form: formData } = $derived(form);

	function pad() {
		$formData[dayId].slots.forEach((slot) => {
			slot.start.hour = Number(String(slot.start.hour).padStart(2, '0'));
			slot.start.minute = Number(String(slot.start.minute).padStart(2, '0'));
			slot.end.hour = Number(String(slot.end.hour).padStart(2, '0'));
			slot.end.minute = Number(String(slot.end.minute).padStart(2, '0'));
		});
	}
</script>

<div class="rounded-md border p-4">
	<Form.Field {form} name="{dayId}.available" class="flex flex-row items-start space-x-3 space-y-0">
		<Form.Control>
			{#snippet children({ props })}
				<Checkbox onblur={pad} {...props} bind:checked={$formData[dayId].available} />
				<div class="space-y-1 leading-none">
					<Form.Label>{dayName}</Form.Label>
				</div>
				<input name={props.name} value="day.available" hidden />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if $formData[dayId].available}
		<div class="flex flex-row gap-4 ml-7 mt-2">
			<div class="flex flex-row gap-2">
				<Form.Field {form} name="{dayId}.slots[0].start.hour">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>From</Form.Label>
							<Input
								onblur={pad}
								{...props}
								type="number"
								bind:value={$formData[dayId].slots[0].start.hour}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Hours (HH)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<span class="mt-10">:</span>
				<Form.Field {form} name="{dayId}.slots[0].start.minute">
					<Form.Control>
						{#snippet children({ props })}
							<!-- required for spacing. it's cursed -->
							<!-- eslint-disable-next-line no-irregular-whitespace -->
							<Form.Label>​</Form.Label>
							<Input
								onblur={pad}
								{...props}
								type="number"
								bind:value={$formData[dayId].slots[0].start.minute}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Minutes (MM)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator orientation="vertical" />
			<div class="flex flex-row gap-2">
				<Form.Field {form} name="{dayId}.slots[0].end.hour">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>To</Form.Label>
							<Input
								onblur={pad}
								{...props}
								type="number"
								bind:value={$formData[dayId].slots[0].end.hour}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Hours (HH)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<span class="mt-10">:</span>
				<Form.Field {form} name="{dayId}.slots[0].end.minute">
					<Form.Control>
						{#snippet children({ props })}
							<!-- required for spacing. it's cursed -->
							<!-- eslint-disable-next-line no-irregular-whitespace -->
							<Form.Label>​</Form.Label>
							<Input
								onblur={pad}
								{...props}
								type="number"
								bind:value={$formData[dayId].slots[0].end.minute}
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
		{#each $formData[dayId].slots as slot, i}
			{#if i > 0}
				<div class="flex flex-row gap-4 ml-7 mt-2">
					<div class="flex flex-row gap-2">
						<Form.Field {form} name="{dayId}.slots[{i}].start.hour">
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
						<Form.Field {form} name="{dayId}.slots[{i}].start.minute">
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
						<Form.Field {form} name="{dayId}.slots[{i}].end.hour">
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
						<Form.Field {form} name="{dayId}.slots[{i}].end.minute">
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
								$formData[dayId].slots.splice(i);
								$formData[dayId].slots = $formData[dayId].slots;
							}}
							variant="destructive"
							size="icon"
						>
							<TrashIcon class="w-4 h-4" />
						</Button>
					</div>
				</div>
			{/if}
		{/each}

		<div class="ml-7">
			<Button
				variant="outline"
				onclick={() => {
					$formData[dayId].slots.push({
						start: { hour: 0, minute: 0 },
						end: { hour: 0, minute: 0 }
					});
					$formData[dayId].slots = $formData[dayId].slots;
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
