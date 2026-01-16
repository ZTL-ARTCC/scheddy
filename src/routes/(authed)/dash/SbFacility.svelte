<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { version } from '$app/environment';
	import TowerControl from '@lucide/svelte/icons/tower-control';
	import { clientConfig } from '$lib/config/client';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<Sidebar.MenuButton
			size="lg"
			class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
		>
			{#snippet child({ props })}
				<a href="/dash" {...props}>
					<div
						class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
					>
						{#if clientConfig.facility.logo_public}
							<img src={clientConfig.facility.logo_public} alt="Facility Logo" />
						{:else}
							<TowerControl class="size-4" />
						{/if}
					</div>

					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">
							{clientConfig.facility.name_public}
						</span>
						<span class="truncate text-muted-foreground text-xs">
							Scheddy v{version}
						</span>
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Menu>
