<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { MentorAvailability } from '$lib/availability';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		dayId: string;
		data: MentorAvailability;
	}
	let { dayId, data }: Props = $props();
</script>

<div class="rounded-md border p-4">
	<div class="flex flex-row items-start space-x-3 space-y-0">
		<Checkbox disabled checked={data.exceptions[dayId].available} />
		<div class="space-y-1 leading-none">
			<Label>
				{dayId}
				{#if data.exceptions[dayId].available}
					<span class="text-sm text-muted-foreground"
						>from <b
							>{String(data.exceptions[dayId].start.hour).padStart(2, '0')}:{String(
								data.exceptions[dayId].start.minute
							).padStart(2, '0')}</b
						>
						to
						<b
							>{String(data.exceptions[dayId].end.hour).padStart(2, '0')}:{String(
								data.exceptions[dayId].end.minute
							).padStart(2, '0')}</b
						></span
					>
				{:else}
					<span class="text-sm text-muted-foreground">unavailable</span>
				{/if}
			</Label>
		</div>
	</div>
</div>
