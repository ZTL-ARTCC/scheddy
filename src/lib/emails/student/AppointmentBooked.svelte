<script lang="ts">
	import type { AppointmentBookedProps } from './appointment_booked';
	import { DateTime } from 'luxon';
	import { BASE_URL } from '$env/static/private';

	let {
		startTime,
		duration,
		mentorName,
		sessionId,
		type,
		timezone,
		link_params,
		reschedule,
		facilityName,
		emailDomain
	}: AppointmentBookedProps = $props();

	let reschedule_link = `${BASE_URL}schedule${link_params}`;
	let title = reschedule ? 'Appointment updated' : 'Appointment booked';
	let bookedText = 'This is your confirmation email for your upcoming session.';
	let updatedText = 'The details for your upcoming session has changed.';
</script>

<h1>{title}</h1>

<p>{reschedule ? updatedText : bookedText}</p>
<p><b>Session type:</b> {type}</p>
<p><b>Date/time:</b> {startTime.setZone(timezone).toLocaleString(DateTime.DATETIME_HUGE)}</p>
<p><b>Timezone:</b> {timezone}</p>
<p><b>Duration:</b> {duration} minutes</p>
<p><b>Mentor:</b> {mentorName}</p>
<a href={reschedule_link}>Cancel/Reschedule</a>

<p>---</p>

<i>Confirmation ID {sessionId}</i>
<i
	>You are receiving this email because you have booked a session with the {facilityName}. If you
	believe to have received this email in error, please contact wm@{emailDomain}.</i
>
