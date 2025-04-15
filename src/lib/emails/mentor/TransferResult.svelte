<script lang="ts">
	import type { SessionTransferResultProps } from './transfer_result';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		studentName,
		mentorName,
		sessionId,
		type,
		timezone,
		facilityName,
		emailDomain,
		result
	}: SessionTransferResultProps = $props();
</script>

<h1>Session transfer request {result}</h1>

<p>Your session transfer request has been {result}. Here are the details:</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Student:</b> {studentName}</p>
{#if result === 'accepted'}
	<p><b>New Mentor:</b> {mentorName}</p>
{/if}

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you are a mentor with the {facilityName}. If you believe to
	have received this email in error, please contact wm@{emailDomain}.</i
>
