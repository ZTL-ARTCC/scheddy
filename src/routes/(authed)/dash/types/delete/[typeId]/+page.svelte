<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import * as Form from "$lib/components/ui/form";
	import * as Select from "$lib/components/ui/select";

	import { Input } from '$lib/components/ui/input';
	import { LoaderCircle } from 'lucide-svelte';
	import { ratingIdDisplay, RATINGS } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/types');
				toast.success('Session type removed!');
			}
		}
	});
	const { enhance, delayed } = form;
</script>

<form class="max-w-3xl flex flex-col gap-2" method="POST" use:enhance>
	<h2 class="font-bold text-xl">Are you sure?</h2>
	<p class="text-sm">This will <b class="text-red-500">permanently</b> remove the session type, as well as <b class="text-red-500">all past and future sessions booked under this type.</b></p>
	<div class="flex flex-row gap-4">
		<Button class="flex-1" onclick={(e) => {e.preventDefault(); goto('/dash/types')}} variant="outline">
			Nevermind
		</Button>
		<Form.Button class="flex-1" variant="destructive">
			{#if $delayed}
				<LoaderCircle class="size-4 animate-spin" />
			{:else}
				Remove
			{/if}
		</Form.Button>
	</div>
</form>