<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { version } from '$app/environment';
	import { TowerControl } from 'lucide-svelte';
	import { clientConfig } from '$lib/config/client';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<Sidebar.MenuButton size="lg">
			{#snippet child({ props })}
				<a href="/dash" {...props}>
					<div
						class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
					>
						<TowerControl class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">
							{clientConfig.facility.name_public}
						</span>
						<span class="truncate text-xs">Scheddy v{version}</span>
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Menu>
