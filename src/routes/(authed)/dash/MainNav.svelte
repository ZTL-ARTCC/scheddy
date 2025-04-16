<script lang="ts">
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CalendarPlusIcon from '@lucide/svelte/icons/calendar-plus';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import LibraryIcon from '@lucide/svelte/icons/library';
	import Layers2Icon from '@lucide/svelte/icons/layers-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import X from '@lucide/svelte/icons/x';
	import { ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT } from '$lib/utils';
	import type { NestedMenuItem } from './nav';
	import NavSection from './NavSection.svelte';

	interface Props {
		role: number;
		userId: number;
	}
	let { role, userId }: Props = $props();

	let commonPages: NestedMenuItem[] = [
		{
			url: '/dash',
			title: 'Dashboard',
			icon: LayoutGridIcon,
			visible: role >= ROLE_MENTOR
		},
		{
			url: '/schedule',
			title: 'Book Session',
			icon: CalendarPlusIcon,
			visible: role >= ROLE_STUDENT
		}
	];

	let schedulingPages: NestedMenuItem[] = [
		{
			url: '/dash/cal',
			title: 'Facility Calendar',
			icon: CalendarIcon,
			visible: role >= ROLE_MENTOR,
			children: [
				{
					url: '/dash/cal/old',
					title: 'Past Sessions',
					icon: HistoryIcon,
					visible: role >= ROLE_MENTOR
				},
				{
					url: '/dash/cal/cancelled',
					title: 'Cancelled Sessions',
					icon: X,
					visible: role >= ROLE_MENTOR
				},
				{
					url: `/dash/cal/transfer-requests`,
					title: 'Transfer Requests',
					icon: ArrowUpDown,
					visible: role >= ROLE_MENTOR
				}
			]
		},
		{
			url: `/dash/mentors/${userId}`,
			title: 'My Schedule',
			icon: CalendarClockIcon,
			visible: role >= ROLE_MENTOR
		}
	];
	let facilityAdministrationPages: NestedMenuItem[] = [
		{
			url: '/dash/types',
			title: 'Session Types',
			icon: LibraryIcon,
			visible: role >= ROLE_STAFF
		},
		{
			url: '/dash/mentors',
			title: 'Mentors',
			icon: GraduationCapIcon,
			visible: role >= ROLE_STAFF
		}
	];
	let siteAdministrationPages: NestedMenuItem[] = [
		{
			url: '/dash/users',
			title: 'User Management',
			icon: UsersIcon,
			visible: role >= ROLE_STAFF,
			children: [
				{
					url: '/dash/users/set',
					title: 'Add/Update Override',
					icon: Layers2Icon,
					visible: role >= ROLE_STAFF
				}
			]
		}
	];

	function isAnythingVisible(data: NestedMenuItem[]): boolean {
		for (let page of data) {
			if (page.visible) return true;
		}
		return false;
	}

	let sections: { data: NestedMenuItem[]; title?: string }[] = [
		{ data: commonPages },
		{ title: 'Scheduling', data: schedulingPages },
		{ title: 'Facility Administration', data: facilityAdministrationPages },
		{ title: 'Site Administration', data: siteAdministrationPages }
	];
</script>

{#each sections as section}
	{#if isAnythingVisible(section.data)}
		<NavSection data={section.data} title={section.title} />
	{/if}
{/each}
