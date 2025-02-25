<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_FACILITY_NAME } from '$env/static/public';
	import {
		CalendarClockIcon,
		CalendarIcon,
		CalendarPlusIcon,
		GraduationCapIcon,
		LayoutGridIcon,
		LibraryIcon,
		LogOutIcon,
		MenuIcon,
		UsersIcon
	} from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT } from '$lib/utils';
	import Button from '$lib/ui/Button.svelte';

	interface Props {
		data: PageData;
		children: Snippet;
	}
	let { data, children }: Props = $props();

	let pages = [
		{
			path: '/dash',
			name: 'Dashboard',
			icon: LayoutGridIcon,
			visible: data.user.role! >= ROLE_MENTOR
		},
		{
			path: '/dash/cal',
			name: 'Facility Calendar',
			icon: CalendarIcon,
			visible: data.user.role! >= ROLE_STAFF
		},
		{
			path: `/dash/mentors/${data.user.id}`,
			name: 'My Schedule',
			icon: CalendarClockIcon,
			visible: data.user.role! >= ROLE_MENTOR
		},
		{
			path: '/dash/types',
			name: 'Session Types',
			icon: LibraryIcon,
			visible: data.user.role! >= ROLE_STAFF
		},
		{
			path: '/dash/users',
			name: 'User Management',
			icon: UsersIcon,
			visible: data.user.role! >= ROLE_STAFF
		},
		{
			path: '/dash/mentors',
			name: 'Mentors',
			icon: GraduationCapIcon,
			visible: data.user.role! >= ROLE_STAFF
		},
		{
			path: '/schedule',
			name: 'Book Session',
			icon: CalendarPlusIcon,
			visible: data.user.role! >= ROLE_STUDENT
		}
	];

	let menuSidebarOpen = $state(false);

	function logout() {
		document.cookie = 'scheddy_token=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/;';
		invalidateAll();
		goto('/');
	}
</script>

<div class="flex flex-col">
	<!-- header -->
	<div
		class="bg-slate-800 min-h-14 h-14 min-w-screen flex flex-row items-center px-6 pt-3 pb-4 justify-between border-b border-slate-900"
	>
		<Button
			class="md:hidden"
			onclick={() => {
				menuSidebarOpen = !menuSidebarOpen;
			}}
			variant="icon"
			size="icon"
		>
			<MenuIcon />
		</Button>
		<h2 class="hidden md:block font-bold">{PUBLIC_FACILITY_NAME}</h2>
		<p class="font-semibold">Hello, {data.user.firstName} {data.user.lastName} ({data.role})</p>
	</div>

	<!-- sidebar & main layout -->
	<div class="flex min-h-[calc(100vh-3.5rem)] h-[calc(100vh-3.5rem)] flex-row flex-1">
		<div
			class="{menuSidebarOpen
				? 'absolute z-10 min-h-screen shadow-2xl'
				: 'hidden'} md:flex flex-col bg-slate-700 px-3 py-4 text-md"
		>
			<span
				class="md:hidden text-xl font-bold flex flex-row min-w-64 px-4 py-3 rounded hover:text-slate-300 transition justify-start items-start text-left hover:cursor-pointer"
			>
				{PUBLIC_FACILITY_NAME}
			</span>
			{#each pages as p}
				{#if p.visible}
					<a
						href={p.path}
						class:bg-slate-600={$page.url.pathname === p.path}
						class="flex flex-row min-w-64 px-4 py-3 rounded hover:text-slate-300 transition justify-start items-start text-left hover:cursor-pointer"
					>
						<p.icon class="w-5 mr-2 font-medium" />
						<span>{p.name}</span>
					</a>
				{/if}
			{/each}
			<button
				onclick={logout}
				class="flex flex-row min-w-64 px-4 py-3 rounded hover:text-slate-300 transition justify-start items-start text-left hover:cursor-pointer"
			>
				<LogOutIcon class="w-5 mr-2 font-medium" />
				<span>Log out</span>
			</button>
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex-1 px-8 py-4 {menuSidebarOpen ? 'blur-sm' : ''}"
			onclick={() => {
				menuSidebarOpen = false;
			}}
		>
			{@render children()}
		</div>
	</div>
</div>
