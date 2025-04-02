<script lang="ts">
	import type { AppointmentBookedProps } from './appointment_booked';
	import { DateTime } from 'luxon';

	let {
		startTime,
		sessionId,
		type,
		timezone,
		mentorName,
		facilityName,
		emailDomain
	}: AppointmentBookedProps = $props();
</script>

<h1>Appointment reminder</h1>

<p>
	This email is to remind you of your upcoming {type} session at {startTime
		.setZone(timezone)
		.toLocaleString(DateTime.DATETIME_HUGE)} ({timezone}).
</p>
<p>
	As it is now within 24 hours, directly contact {mentorName}, your mentor, to make any changes.
</p>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you have booked a session with the {facilityName}. If you
	believe to have received this email in error, please contact wm@{emailDomain}.</i
>
