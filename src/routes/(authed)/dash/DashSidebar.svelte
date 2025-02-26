<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { roleString } from '$lib/utils';
	import SbFacility from './SbFacility.svelte';
	import MainNav from './MainNav.svelte';
	import NavUser from './NavUser.svelte';

	interface Props {
		role: number;
		userId: number;
		name: string;
	}
	let { role, userId, name }: Props = $props();
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<SbFacility />
	</Sidebar.Header>

	<Sidebar.Content>
		<MainNav {role} {userId} />
	</Sidebar.Content>

	<Sidebar.Footer>
		<NavUser {name} role={roleString(role)} />
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
