<script lang="ts">
	import { page } from '$app/state';
	import { roleOf } from '$lib';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		firstName: string;
		lastName: string;
		id: number;
	}
	let { firstName, lastName, id }: Props = $props();
</script>

{#if roleOf(page.data.user) >= ROLE_STAFF || id === page.data.user.id}
	<a class="hover:underline underline-offset-4" href="/dash/mentors/{id}">{firstName} {lastName}</a>
{:else}
	{firstName} {lastName}
{/if}
