<script lang="ts">
	import type { sessions, sessionTypes, users } from '$lib/server/db/schema';

	interface Props {
		student: typeof users.$inferSelect;
		mentor: typeof users.$inferSelect;
		session: typeof sessions.$inferSelect;
		sessionType: typeof sessionTypes.$inferSelect;
	}
	let { student, mentor, sessionType }: Props = $props();
</script>

<p>{sessionType.name}</p>
<p>{student.firstName} {student.lastName}</p>
<p>with {mentor.firstName} {mentor.lastName}</p>
