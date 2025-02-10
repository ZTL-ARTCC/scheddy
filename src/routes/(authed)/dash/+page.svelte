<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let time = $state(new Date());
	let hours = $derived(time.getHours());
	let timeofday = $derived.by(() => {
		// 4am-12: morning
		// 12-5: afternoon
		// 5+: evening
		if (hours >= 4 && hours <= 12) {
			return 'morning';
		} else if (hours >= 12 && hours <= 17) {
			return 'afternoon';
		} else {
			return 'evening';
		}
	});
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">Good {timeofday}, {data.user.firstName}</h1>
	<p>
		You have {data.yourSessions} upcoming sessions
		<a
			class="text-blue-500 hover:text-blue-600 transition font-semibold ml-4"
			href="/dash/mentors/{data.user.id}">Your schedule &rarr;</a
		>
	</p>
	<p>
		In total, there are {data.upcoming} upcoming sessions with {data.mentors} different mentors
		<a class="text-blue-500 hover:text-blue-600 transition font-semibold ml-4" href="/dash/cal"
			>Facility schedule &rarr;</a
		>
	</p>
</div>
