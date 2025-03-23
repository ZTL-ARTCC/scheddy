import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './SessionCanceled.txt';
import SessionCanceled from './SessionCanceled.svelte';
import { render } from 'svelte/server';
import { roleString } from '$lib/utils';

export interface SessionCanceledProps {
	startTime: DateTime;
	type: string;
	duration: number;
	studentName: string;
	sessionId: string;
	timezone: string;
	facilityName: string;
	emailDomain: string;
	cancellationReason: string;
	cancellationUserLevel: number;
}

export function session_canceled(props: SessionCanceledProps): EmailContent {
	return {
		raw: templateOut(plaintextTemplate, {
			startTime: props.startTime.setZone(props.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			type: props.type,
			duration: props.duration.toString(),
			studentName: props.studentName,
			sessionId: props.sessionId,
			timezone: props.timezone,
			facilityName: props.facilityName,
			emailDomain: props.emailDomain,
			cancellationReason: props.cancellationReason,
			role: roleString(props.cancellationUserLevel)
		}),
		html: render(SessionCanceled, {
			props: props
		}).body
	};
}
