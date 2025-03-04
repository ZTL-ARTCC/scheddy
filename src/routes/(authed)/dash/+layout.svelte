<script lang="ts">
	import type { PageData } from './$types';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import type { Snippet } from 'svelte';
	import DashSidebar from './DashSidebar.svelte';
	import { roleOf } from '$lib';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
		children: Snippet;
	}
	let { data, children }: Props = $props();
</script>

<Sidebar.Provider>
	<DashSidebar
		role={roleOf(data.user)}
		userId={data.user.id}
		name="{data.user.firstName} {data.user.lastName}"
	/>
	<main class="flex-1">
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has[[data-collapsible=icon]]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				{#if page.data.breadcrumbs}
					<Separator orientation="vertical" class="mr-2 h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							{#each page.data.breadcrumbs as breadcrumb, i}
								{@const last = i === page.data.breadcrumbs.length - 1}
								<Breadcrumb.Item>
									{#if breadcrumb.url}
										<Breadcrumb.Link class={last ? '' : 'hidden md:block'} href={breadcrumb.url}
											>{breadcrumb.title}</Breadcrumb.Link
										>
									{:else}
										<Breadcrumb.Page class={last ? '' : 'hidden md:block'}
											>{breadcrumb.title}</Breadcrumb.Page
										>
									{/if}
								</Breadcrumb.Item>
								{#if !last}
									<Breadcrumb.Separator class={last ? '' : 'hidden md:block'} />
								{/if}
							{/each}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				{/if}
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
