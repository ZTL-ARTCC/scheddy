<script lang="ts">
	import { version } from '$app/environment';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { clientConfig } from '$lib/config/client';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import LogIn from '@lucide/svelte/icons/log-in';

	const url = `${
		clientConfig.auth.vatsim.base_public
	}/oauth/authorize?response_type=code&client_id=${
		clientConfig.auth.vatsim.client_id_public
	}&redirect_uri=${clientConfig.site.base_public}callback`;

	let isLoading = false;
</script>

<div class="grid min-h-screen w-full place-items-center bg-muted/20">
	<Card.Root class="w-full max-w-md text-center shadow-xl">
		<Card.Header class="text-center">
			<div class="space-y-1">
				<Card.Title class="text-3xl font-bold tracking-tight">Scheddy</Card.Title>
				<Card.Description>{clientConfig.facility.name_public}</Card.Description>
			</div>
		</Card.Header>

		<Card.Content>
			<Button
				href={url}
				onclick={() => {
					isLoading = true;
				}}
				disabled={isLoading}
				class="w-full"
			>
				{#if isLoading}
					<Loader2 class="mr-2 size-4 animate-spin" />
					Loading...
				{:else}
					Login with VATSIM <LogIn />
				{/if}
			</Button>
		</Card.Content>

		<Card.Footer class="flex flex-col text-xs text-muted-foreground">
			<a
				href="https://github.com/ZTL-ARTCC/scheddy"
				target="_blank"
				rel="noreferrer"
				class="group inline-flex items-center gap-1.5 transition-colors hover:text-primary font-medium"
			>
				<span class="font-bold tracking-tighter">scheddy</span>
				<span class="text-muted-foreground/50">v{version}</span>
				<span class="mx-1 h-3 w-[1px] bg-muted-foreground/20"></span>
				<span class="flex items-center gap-1">
					Built with
					<HeartIcon class="size-3  fill-red-500 text-red-500" />
					by vZTL
				</span>
			</a>
		</Card.Footer>
	</Card.Root>
</div>
