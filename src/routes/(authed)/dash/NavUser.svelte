<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { goto, invalidateAll } from '$app/navigation';
	import { setMode, systemPrefersMode } from 'mode-watcher';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import * as Avatar from '$lib/components/ui/avatar';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunMoonIcon from '@lucide/svelte/icons/sun-moon';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	interface Props {
		name: string;
		role: string;
	}

	let { name, role }: Props = $props();
	const sidebar = useSidebar();

	async function logout() {
		document.cookie = 'scheddy_token=; Max-Age=0; path=/;';
		await invalidateAll();
		goto('/');
	}

	const systemIcon = $systemPrefersMode === 'dark' ? MoonIcon : SunIcon;

	const themeOptions = [
		{ mode: 'system', label: 'System', icon: systemIcon },
		{ mode: 'light', label: 'Light', icon: SunIcon },
		{ mode: 'dark', label: 'Dark', icon: MoonIcon }
	] as const;

	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase();
</script>

{#snippet userInfo()}
	<Avatar.Root class="size-8 mr-1">
		<Avatar.Fallback>
			<span class="font-medium">{initials}</span>
		</Avatar.Fallback>
	</Avatar.Root>
	<div class="grid flex-1 text-left text-sm leading-tight">
		<span class="truncate font-semibold">{name}</span>
		<span class="truncate text-xs text-muted-foreground">{role}</span>
	</div>
{/snippet}

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="transition-all duration-200 hover:bg-sidebar-accent active:scale-[0.98] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						{@render userInfo()}
						<ChevronsUpDown class="ml-auto size-4 opacity-50" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				class="min-w-56 overflow-hidden rounded-xl border shadow-lg transition-in fade-in zoom-in-95"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={8}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-3 p-2 text-left text-sm">
						{@render userInfo()}
					</div>
				</DropdownMenu.Label>

				<div class="px-1 py-1">
					<DropdownMenu.Separator />
				</div>

				<DropdownMenu.Group class="p-1">
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger
							class="cursor-pointer gap-2 rounded-md px-2 py-2 focus:bg-accent"
						>
							<SunMoonIcon class="size-4 text-muted-foreground" />
							<span class="font-medium">Theme</span>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent class="rounded-lg shadow-md">
							{#each themeOptions as option}
								<DropdownMenu.Item
									onclick={() => setMode(option.mode)}
									class="flex cursor-pointer items-center gap-2 py-2"
								>
									<option.icon class="size-4 opacity-70" />
									<span class="flex-1">{option.label}</span>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Group>

				<div class="px-1 py-1">
					<DropdownMenu.Separator />
				</div>

				<div class="p-1">
					<DropdownMenu.Item
						onclick={logout}
						class="flex cursor-pointer items-center gap-2 rounded-md p-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
					>
						<LogOutIcon class="size-4" />
						<span class="font-medium">Log out</span>
					</DropdownMenu.Item>
				</div>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
