import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './AppointmentBooked.txt?raw';
import AppointmentBooked from './AppointmentBooked.svelte';
import { render } from 'svelte/server';

export interface AppointmentBookedProps {
	startTime: DateTime;
	type: string;
	duration: number;
	mentorName: string;
	sessionId: string;
	timezone: string;
	link_params: string;
	reschedule?: boolean;
}

export function appointment_booked(props: AppointmentBookedProps): EmailContent {
	return {
		raw: templateOut(plaintextTemplate, {
			startTime: props.startTime.setZone(props.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			type: props.type,
			duration: props.duration.toString(),
			mentorName: props.mentorName,
			sessionId: props.sessionId,
			timezone: props.timezone,
			link_params: props.link_params,
			reschedule: props.reschedule ? 'rescheduled' : ''
		}),
		html: render(AppointmentBooked, {
			props: props
		}).body
	};
}
