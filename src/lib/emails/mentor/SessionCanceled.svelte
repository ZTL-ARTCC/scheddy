<script lang="ts">
	import { roleString } from '$lib/utils';
	import type { SessionCanceledProps } from './session_canceled';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		studentName,
		sessionId,
		type,
		timezone,
		facilityName,
		emailDomain,
		cancellationReason,
		cancellationUserLevel
	}: SessionCanceledProps = $props();
</script>

<h1>Session Canceled</h1>

<p>This session has been canceled.</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Student:</b> {studentName}</p>

<p>---</p>

<p><b>Reason:</b> {roleString(cancellationUserLevel)} Cancel - {cancellationReason}</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you are a mentor with the {facilityName}. If you believe to
	have received this email in error, please contact wm@{emailDomain}.</i
>
