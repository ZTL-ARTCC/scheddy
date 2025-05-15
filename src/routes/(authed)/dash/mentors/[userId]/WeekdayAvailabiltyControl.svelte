<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { MentorAvailability } from '$lib/availability';
	import { Label } from '$lib/components/ui/label';
	import type { DayOfWeek } from '$lib/utils';

	interface Props {
		dayId: DayOfWeek;
		dayName: string;
		data: MentorAvailability;
	}
	let { data, dayId, dayName }: Props = $props();
</script>

<div class="rounded-md border p-4">
	<div class="flex flex-row items-start space-x-3 space-y-0">
		<Checkbox disabled checked={data[dayId].available} />
		<div class="space-y-1 leading-none">
			<Label>
				{dayName}
				{#if data[dayId].available}
					{#each data[dayId].slots as _, i}
						<span class="text-sm text-muted-foreground">
							from <b>
								{String(data[dayId].slots[i].start.hour).padStart(2, '0')}:{String(
									data[dayId].slots[i].start.minute
								).padStart(2, '0')}
							</b>
							to
							<b>
								{String(data[dayId].slots[i].end.hour).padStart(2, '0')}:{String(
									data[dayId].slots[i].end.minute
								).padStart(2, '0')}
							</b>
						</span>
					{/each}
				{:else}
					<span class="text-sm text-muted-foreground">unavailable</span>
				{/if}
			</Label>
		</div>
	</div>
</div>
