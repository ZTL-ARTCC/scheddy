import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './NewSession.txt?raw';
import NewSession from './NewSession.svelte';
import { render } from 'svelte/server';

export interface NewSessionProps {
	startTime: DateTime;
	type: string;
	duration: number;
	studentName: string;
	sessionId: string;
	timezone: string;
	reschedule?: boolean;
	facilityName: string;
	emailDomain: string;
}

export function new_session(props: NewSessionProps): EmailContent {
	return {
		raw: templateOut(plaintextTemplate, {
			startTime: props.startTime.setZone(props.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			type: props.type,
			duration: props.duration.toString(),
			studentName: props.studentName,
			sessionId: props.sessionId,
			timezone: props.timezone,
			facilityName: props.facilityName,
			emailDomain: props.emailDomain
		}),
		html: render(NewSession, {
			props: props
		}).body
	};
}
