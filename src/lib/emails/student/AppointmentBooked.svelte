<script lang="ts">
	import type { AppointmentBookedProps } from './appointment_booked';
	import { DateTime } from 'luxon';
	import { serverConfig } from '$lib/config/server';

	let {
		startTime,
		duration,
		mentorName,
		sessionId,
		type,
		timezone,
		link,
		facilityName,
		emailDomain
	}: AppointmentBookedProps = $props();

	let rescheduleLink = `${serverConfig.site.base_public}schedule${link}`;
</script>

<h1>Appointment booked</h1>

<p>This is your confirmation email for your upcoming session.</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Mentor:</b> {mentorName}</p>
<a href={rescheduleLink}>Cancel</a>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you have booked a session with the {facilityName}. If you
	believe to have received this email in error, please contact wm@{emailDomain}.</i
>
