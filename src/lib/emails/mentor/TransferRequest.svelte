<script lang="ts">
	import type { SessionTransferRequestProps } from './transfer_request';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		studentName,
		sessionId,
		type,
		timezone,
		mentorName,
		facilityName,
		emailDomain,
		transferLink
	}: SessionTransferRequestProps = $props();
</script>

<h1>New session transfer request</h1>

<p>Another mentor has requested to transfer a session to you. Here are the details:</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Mentor:</b> {mentorName}</p>
<p><b>Student:</b> {studentName}</p>
<a href={transferLink}>Accept/Decline</a>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you are a mentor with the {facilityName}. If you believe to
	have received this email in error, please contact wm@{emailDomain}.</i
>
