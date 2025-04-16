<script lang="ts">
	import type { NestedMenuItem } from './nav';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	// yes, this imports itself
	import NavItem from './NavItem.svelte';
	import { page } from '$app/state';

	interface Props {
		data: NestedMenuItem[];
		isSub: boolean;
	}
	let { data, isSub }: Props = $props();

	let components = $derived({
		item: isSub ? Sidebar.MenuSubItem : Sidebar.MenuItem,
		button: isSub ? Sidebar.MenuSubButton : Sidebar.MenuButton
	});
</script>

{#each data as item (item.title)}
	{#if item.visible}
		{@const isActive = page.url.pathname === item.url}
		{#if item.children}
			<Collapsible.Root open={page.url.pathname.startsWith(item.url)} class="group/collapsible">
				{#snippet child({ props })}
					<components.item {...props}>
						<Collapsible.Trigger class={isActive ? 'bg-sidebar-accent' : ''}>
							{#snippet child({ props })}
								<components.button {...props}>
									{#snippet tooltipContent()}
										{item.title}
									{/snippet}
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											{#if item.icon}
												<item.icon />
											{/if}
											<span>{item.title}</span>
											<ChevronRightIcon
												class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
											/>
										</a>
									{/snippet}
								</components.button>
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							<Sidebar.MenuSub>
								<NavItem data={item.children} isSub={true} />
							</Sidebar.MenuSub>
						</Collapsible.Content>
					</components.item>
				{/snippet}
			</Collapsible.Root>
		{:else}
			<components.item>
				<components.button class={isActive ? 'bg-sidebar-accent' : ''}>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</components.button>
			</components.item>
		{/if}
	{/if}
{/each}
