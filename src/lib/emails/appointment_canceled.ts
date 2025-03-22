import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './AppointmentCanceled.txt';
import AppointmentCanceled from './AppointmentCanceled.svelte';
import { render } from 'svelte/server';
import { roleString } from '$lib/utils';

export interface AppointmentCanceledProps {
	startTime: DateTime;
	type: string;
	duration: number;
	mentorName: string;
	sessionId: string;
	timezone: string;
	facilityName: string;
	emailDomain: string;
	cancellationReason: string;
	cancellationUserLevel: number;
	student: boolean;
}

export function appointment_canceled(props: AppointmentCanceledProps): EmailContent {
	return {
		raw: templateOut(plaintextTemplate, {
			startTime: props.startTime.setZone(props.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			type: props.type,
			duration: props.duration.toString(),
			mentorName: props.mentorName,
			sessionId: props.sessionId,
			timezone: props.timezone,
			facilityName: props.facilityName,
			emailDomain: props.emailDomain,
			cancellationReason: props.cancellationReason,
			role: roleString(props.cancellationUserLevel)
		}),
		html: render(AppointmentCanceled, {
			props: props
		}).body
	};
}
