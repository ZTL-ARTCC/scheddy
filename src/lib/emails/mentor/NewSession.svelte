<script lang="ts">
	import type { NewSessionProps } from '$lib/emails/mentor/new_session';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		studentName,
		sessionId,
		type,
		timezone,
		facilityName,
		emailDomain
	}: NewSessionProps = $props();
</script>

<h1>New session booked</h1>

<p>A student has booked an appointment. Here are the details:</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Student:</b> {studentName}</p>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you are a mentor with the {facilityName}. If you believe to
	have received this email in error, please contact wm@{emailDomain}.</i
>
