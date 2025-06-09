<script lang="ts">
	import type { PageData } from './$types';
	import {
		TimeGrid,
		DayGrid,
		List,
		ResourceTimeline,
		ResourceTimeGrid,
		Interaction,
		Calendar
	} from '@event-calendar/core';
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import { roleOf } from '$lib';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let container: HTMLDivElement;

	let options: Calendar.Options = $derived({
		view: 'timeGridWeek',
		buttonText: {
			listWeek: 'Week - List',
			timeGridDay: 'Day',
			timeGridWeek: 'Week',
			today: 'Jump to today'
		},
		scrollTime: (() => {
			const now = DateTime.now();
			return now.toObject();
		})(),
		headerToolbar: {
			start: 'title',
			center: '',
			end: 'timeGridWeek,timeGridDay,listWeek today prev,next'
		},
		resources: data.mentors.map((u) => {
			return {
				id: u.id,
				title: u.firstName + ' ' + u.lastName
			};
		}),
		eventClick: async (info) => {
			if (info.event.resourceIds[0] == data.user.id || roleOf(data.user) >= ROLE_STAFF) {
				await goto(`/dash/sessions/${info.event.id}`);
			}
		},
		eventMouseEnter: (info) => {
			console.log('here');
			if (info.event.resourceIds[0] == data.user.id || roleOf(data.user) >= ROLE_STAFF) {
				container.style.cursor = 'pointer';
			}
		},
		eventMouseLeave: () => {
			container.style.cursor = 'auto';
		},
		events: data.mentorSessions.map((u) => {
			const cyrb53 = (str, seed = 0) => {
				let h1 = 0xdeadbeef ^ seed,
					h2 = 0x41c6ce57 ^ seed;
				for (let i = 0, ch; i < str.length; i++) {
					ch = str.charCodeAt(i);
					h1 = Math.imul(h1 ^ ch, 2654435761);
					h2 = Math.imul(h2 ^ ch, 1597334677);
				}
				h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
				h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
				h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
				h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

				return 4294967296 * (2097151 & h2) + (h1 >>> 0);
			};

			const selector = cyrb53(u.sessionType.id) % 17;
			const backgroundColors = [
				'#991b1b',
				'#9a3412',
				'#92400e',
				'#854d0e',
				'#3f6212',
				'#166534',
				'#065f46',
				'#115e59',
				'#155e75',
				'#075985',
				'#1e40af',
				'#3730a3',
				'#5b21b6',
				'#6b21a8',
				'#86198f',
				'#9d174d',
				'#9f1239'
			];
			const foregroundColors = [
				'#fef2f2',
				'#fff7ed',
				'#fffbeb',
				'#fefce8',
				'#f7fee7',
				'#f0fdf4',
				'#ecfdf5',
				'#f0fdfa',
				'#ecfeff',
				'#f0f9ff',
				'#eff6ff',
				'#eef2ff',
				'#f5f3ff',
				'#faf5ff',
				'#fdf4ff',
				'#fdf2f8',
				'#fff1f2'
			];

			return {
				id: u.session.id,
				resourceIds: [u.mentor.id],
				start: new Date(u.session.start),
				end: new Date(new Date(u.session.start).getTime() + 60000 * u.sessionType.length),
				editable: false,
				startEditable: false,
				durationEditable: false,
				title: u.calendarContent,
				backgroundColor: backgroundColors[selector],
				textColor: foregroundColors[selector]
			};
		}),
		slotHeight: 32,
		nowIndicator: true
	});
</script>

<div bind:this={container} class="ec-dark">
	<Calendar
		plugins={[TimeGrid, DayGrid, List, ResourceTimeline, ResourceTimeGrid, Interaction]}
		{options}
	/>
</div>

<style>
	:global(.ec-time-grid .ec-time, .ec-time-grid .ec-line) {
		height: 32px;
	}
</style>
