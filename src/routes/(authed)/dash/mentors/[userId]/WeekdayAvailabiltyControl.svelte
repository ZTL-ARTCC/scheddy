<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { MentorAvailability } from '$lib/availability';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		dayId: string;
		dayName: string;
		data: MentorAvailability;
	}
	let { data, dayId, dayName }: Props = $props();
	const day = $derived((data as unknown as Record<string, import('$lib/availability').DayAvailability>)[dayId]);
</script>

<div class="rounded-md border p-4">
	<div class="flex flex-row items-start space-x-3 space-y-0">
		<Checkbox disabled checked={day.available} />
		<div class="space-y-1 leading-none">
			<Label>
				{dayName}
				{#if day.available}
					<span class="text-sm text-muted-foreground"
						>from <b
							>{String(day.start.hour).padStart(2, '0')}:{String(
								day.start.minute
							).padStart(2, '0')}</b
						>
						to
						<b
							>{String(day.end.hour).padStart(2, '0')}:{String(
								day.end.minute
							).padStart(2, '0')}</b
						></span
					>
					{#if day.extraRecords}
						{#each day.extraRecords as record}
							<span class="text-sm text-muted-foreground"
								>and from <b
									>{String(record.start.hour).padStart(2, '0')}:{String(
										record.start.minute
									).padStart(2, '0')}</b
								>
								to
								<b
									>{String(record.end.hour).padStart(2, '0')}:{String(record.end.minute).padStart(
										2,
										'0'
									)}</b
								></span
							>
						{/each}
					{/if}
				{:else}
					<span class="text-sm text-muted-foreground">unavailable</span>
				{/if}
			</Label>
		</div>
	</div>
</div>
