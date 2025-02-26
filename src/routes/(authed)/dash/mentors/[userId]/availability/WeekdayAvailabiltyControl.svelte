<script lang="ts">
	import type { AvailSchema } from './availSchema';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		dayId: string;
		dayName: string;
		available: boolean;
		startHour: number;
		startMinute: number;
		endHour: number;
		endMinute: number;
		form: SuperForm<Infer<AvailSchema>>;
	}
	let {
		dayId,
		dayName,
		available = $bindable(),
		startHour = $bindable(),
		startMinute = $bindable(),
		endHour = $bindable(),
		endMinute = $bindable(),
		form
	}: Props = $props();
	const { form: formData } = form;

	function pad() {
		startHour = String(startHour).padStart(2, '0');
		startMinute = String(startMinute).padStart(2, '0');
		endHour = String(endHour).padStart(2, '0');
		endMinute = String(endMinute).padStart(2, '0');
	}
</script>

<div class="rounded-md border p-4">
	<Form.Field {form} name="{dayId}.available" class="flex flex-row items-start space-x-3 space-y-0">
		<Form.Control>
			{#snippet children({ props })}
				<Checkbox onblur={pad} {...props} bind:checked={available} />
				<div class="space-y-1 leading-none">
					<Form.Label>{dayName}</Form.Label>
				</div>
				<input name={props.name} value={available} hidden />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if available}
		<div class="flex flex-row gap-4 ml-7 mt-2">
			<div class="flex flex-row gap-2">
				<Form.Field {form} name="{dayId}.start.hour">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>From</Form.Label>
							<Input onblur={pad} {...props} type="number" bind:value={startHour} />
						{/snippet}
					</Form.Control>
					<Form.Description>Hours (HH)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<span class="mt-10">:</span>
				<Form.Field {form} name="{dayId}.start.minute">
					<Form.Control>
						{#snippet children({ props })}

						<!-- required for spacing. it's cursed -->
						<!-- eslint-disable-next-line no-irregular-whitespace -->
							<Form.Label>​</Form.Label>
							<Input onblur={pad} {...props} type="number" bind:value={startMinute} />
						{/snippet}
					</Form.Control>
					<Form.Description>Minutes (MM)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator orientation="vertical" />
			<div class="flex flex-row gap-2">
				<Form.Field {form} name="{dayId}.end.hour">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>To</Form.Label>
							<Input onblur={pad} {...props} type="number" bind:value={endHour} />
						{/snippet}
					</Form.Control>
					<Form.Description>Hours (HH)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<span class="mt-10">:</span>
				<Form.Field {form} name="{dayId}.end.minute">
					<Form.Control>
						{#snippet children({ props })}

						<!-- required for spacing. it's cursed -->
						<!-- eslint-disable-next-line no-irregular-whitespace -->
							<Form.Label>​</Form.Label>
							<Input onblur={pad} {...props} type="number" bind:value={endMinute} />
						{/snippet}
					</Form.Control>
					<Form.Description>Minutes (MM)</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</div>
		</div>
		<div class="ml-7">
			<span class="text-xs text-muted-foreground"
				>You can add times such as 25:00 to extend availability past midnight. Times to be entered
				in 24-hour notation, <b>local time in {$formData.timezone}.</b></span
			>
		</div>
	{/if}
</div>
