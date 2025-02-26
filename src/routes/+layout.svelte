<script lang="ts">
	import '../app.css';
	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	interface Props {
		children: Snippet;
		data: PageData;
	}
	let { children, data }: Props = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<Toaster richColors />
<ModeWatcher />

<div class="min-w-screen min-h-screen">
	{@render children()}
</div>
