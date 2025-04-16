<script lang="ts">
	import { version } from '$app/environment';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { clientConfig } from '$lib/config/client';
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card.Root class="max-w-xl mx-4 text-center">
		<Card.Header>
			<Card.Title>{clientConfig.facility.name_public} - Scheddy</Card.Title>
		</Card.Header>
		<Card.Content>
			<Button
				href="{clientConfig.auth.vatsim
					.base_public}/oauth/authorize?response_type=code&client_id={clientConfig.auth.vatsim
					.client_id_public}&redirect_uri={clientConfig.site.base_public}callback"
			>
				Login with VATSIM
			</Button>
		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground justify-center">
			<a
				target="_blank"
				href="https://github.com/ZTL-ARTCC/scheddy"
				class="hover:underline underline-offset-4"
				>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
			>
		</Card.Footer>
	</Card.Root>
</div>
