<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { clientConfig } from '$lib/config/client';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	function logout() {
		document.cookie = 'scheddy_token=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/;';
		invalidateAll();
		goto('/');
	}

	async function del() {
		await fetch('?', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		await invalidateAll();
		await goto('/my_sessions');
		toast.success('Session cancelled successfully!');
	}
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card.Root class="max-w-xl mx-4 text-center px-4 py-2">
		<Card.Header>
			<p class="text-sm text-right text-slate-500 mb-1">
				Logged in as {data.user.firstName}
				{data.user.lastName} ({data.role}) -
				<button onclick={logout} class="hover:underline">Log out</button>
			</p>
			<Card.Title>Cancel appointment at {clientConfig.facility.name_public}</Card.Title>
		</Card.Header>
		<Card.Content>
			<h2>Are you sure?</h2>
			<div class="flex flex-row gap-4 mt-4">
				<Button href="/my_sessions" class="flex-1" variant="outline">Nevermind</Button>
				<Button onclick={del} class="flex-1" variant="destructive">Yes, I'm sure</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
