<script lang="ts">
	import type { AppointmentBookedProps } from '$lib/emails/appointment_booked';
	import { DateTime } from 'luxon';

	let { startTime, duration, mentorName, sessionId, type, timezone, reschedule }: AppointmentBookedProps =
		$props();

	let reschedule_link = `https://scheddy.ztlartcc.org/sessions/${sessionId}`;
	let title = reschedule ? 'Appointment updated' : 'Appointment booked';
</script>

<h1>{title}</h1>

<p>This is your confirmation email for your upcoming session.</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Mentor:</b> {mentorName}</p>
<a href={reschedule_link}>Cancel/Reschedule</a>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you have booked a session with the ZTL ARTCC. If you believe
	to have received this email in error, please contact wm@ztlartcc.org.</i
>
