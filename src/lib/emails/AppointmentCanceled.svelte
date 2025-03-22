<script lang="ts">
	import { ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT } from '$lib/utils';
	import type { AppointmentCanceledProps } from './appointment_canceled';
	import { DateTime } from 'luxon';

	let {
		startTime,
		duration,
		mentorName,
		sessionId,
		type,
		timezone,
		facilityName,
		emailDomain,
		cancelationReason,
		cancelationUserLevel,
		student
	}: AppointmentCanceledProps = $props();

	let role = $state('');

	if (cancelationUserLevel === ROLE_STUDENT) {
		role = 'Student';
	} else if (cancelationUserLevel === ROLE_MENTOR) {
		role = 'Mentor';
	} else if (cancelationUserLevel >= ROLE_STAFF) {
		role = 'Staff';
	}

	let title = student ? 'Appointment' : 'Session'
</script>

<h1>{title} Canceled</h1>

<p>This session has been canceled.</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Mentor:</b> {mentorName}</p>

<p>---</p>

<p><b>Reason:</b> {role} Cancel - {cancelationReason}</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you have booked a session with the {facilityName}. If you
	believe to have received this email in error, please contact wm@{emailDomain}.</i
>
