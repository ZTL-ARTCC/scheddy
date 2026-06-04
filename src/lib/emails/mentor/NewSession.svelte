<script lang="ts">
	import type { NewSessionProps } from './new_session';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		studentName,
		sessionId,
		type,
		timezone,
		reschedule,
		facilityName,
		emailDomain
	}: NewSessionProps = $props();

	// Rendered to email
	// svelte-ignore state_referenced_locally
	let title = reschedule ? 'Session updated' : 'New session booked';
	let bookedText = 'A student has booked an appointment. Here are the details:';
	let updatedText = 'The details for your session has changed.';
</script>

<h1>{title}</h1>

<p>{reschedule ? updatedText : bookedText}</p>
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
