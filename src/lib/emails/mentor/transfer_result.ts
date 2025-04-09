import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './TransferResult.txt?raw';
import TransferResult from './TransferResult.svelte';
import { render } from 'svelte/server';

export interface SessionTransferResultProps {
	startTime: DateTime;
	type: string;
	duration: number;
	studentName: string;
	mentorName: string;
	sessionId: string;
	timezone: string;
	facilityName: string;
	emailDomain: string;
	result: 'accepted' | 'declined';
}

export function session_transfer_result(props: SessionTransferResultProps): EmailContent {
	return {
		raw: templateOut(plaintextTemplate, {
			startTime: props.startTime.setZone(props.timezone).toLocaleString(DateTime.DATETIME_HUGE),
			type: props.type,
			duration: props.duration.toString(),
			studentName: props.studentName,
			mentorName: props.mentorName,
			sessionId: props.sessionId,
			timezone: props.timezone,
			facilityName: props.facilityName,
			emailDomain: props.emailDomain,
      result: props.result
		}),
		html: render(TransferResult, {
			props: props
		}).body
	};
}
