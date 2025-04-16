<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunMoonIcon from '@lucide/svelte/icons/sun-moon';
	import UserIcon from '@lucide/svelte/icons/user';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { goto, invalidateAll } from '$app/navigation';
	import { setMode, systemPrefersMode } from 'mode-watcher';

	interface Props {
		name: string;
		role: string;
	}
	let { name, role }: Props = $props();

	const sidebar = useSidebar();

	function logout() {
		document.cookie = 'scheddy_token=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/;';
		invalidateAll();
		goto('/');
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<div
							class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
						>
							<UserIcon class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{name}</span>
							<span class="truncate text-xs">{role}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<div
							class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
						>
							<UserIcon class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{name}</span>
							<span class="truncate text-xs">{role}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>
						<SunMoonIcon class="mr-2 size-4" />
						<span>Theme</span>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent>
						<DropdownMenu.Item
							onclick={() => {
								setMode('system');
							}}
						>
							{#if $systemPrefersMode === 'light'}
								<SunIcon class="mr-2 size-4" />
								<span>System (light)</span>
							{:else if $systemPrefersMode === 'dark'}
								<MoonIcon class="mr-2 size-4" />
								<span>System (dark)</span>
							{:else}
								<SunMoonIcon class="mr-2 size-4" />
								<span>System</span>
							{/if}
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => {
								setMode('light');
							}}
						>
							<SunIcon class="mr-2 size-4" />
							<span>Light</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => {
								setMode('dark');
							}}
						>
							<MoonIcon class="mr-2 size-4" />
							<span>Dark</span>
						</DropdownMenu.Item>
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={logout}>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
