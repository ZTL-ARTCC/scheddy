<script lang="ts">
	import {
		PUBLIC_FACILITY_NAME,
		PUBLIC_VATSIM_OAUTH_BASE,
		PUBLIC_VATSIM_OAUTH_CLIENT_ID,
		PUBLIC_VATSIM_OAUTH_REDIRECT_URL
	} from '$env/static/public';
	import { version } from '$app/environment';
	import { HeartIcon } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card.Root class="max-w-xl mx-4 text-center">
		<Card.Header>
			<Card.Title>{PUBLIC_FACILITY_NAME} - Scheddy</Card.Title>
		</Card.Header>
		<Card.Content>
			<Button
				href="{PUBLIC_VATSIM_OAUTH_BASE}/oauth/authorize?response_type=code&client_id={PUBLIC_VATSIM_OAUTH_CLIENT_ID}&redirect_uri={PUBLIC_VATSIM_OAUTH_REDIRECT_URL}"
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

<!--
<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card>
		<h1 class="font-bold text-2xl text-center">{PUBLIC_FACILITY_NAME} - Scheddy</h1>

		<Button
			href="{PUBLIC_VATSIM_OAUTH_BASE}/oauth/authorize?response_type=code&client_id={PUBLIC_VATSIM_OAUTH_CLIENT_ID}&redirect_uri={PUBLIC_VATSIM_OAUTH_REDIRECT_URL}"
		>
			Login with VATSIM
		</Button>

		<a
			target="_blank"
			href="https://github.com/ZTL-ARTCC/scheddy"
			class="block hover:underline text-sm text-slate-500"
			>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
		>
	</Card>
</div>
-->
