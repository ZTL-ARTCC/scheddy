import { DateTime } from 'luxon';
import { type EmailContent, templateOut } from '$lib/email';
import plaintextTemplate from './TransferRequest.txt?raw';
import TransferRequest from './TransferRequest.svelte';
import { render } from 'svelte/server';

export interface SessionTransferRequestProps {
	startTime: DateTime;
	type: string;
	duration: number;
	studentName: string;
	mentorName: string;
	sessionId: string;
	timezone: string;
	facilityName: string;
	emailDomain: string;
	transferLink: string;
}

export function new_session_transfer_request(props: SessionTransferRequestProps): EmailContent {
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
      transferLink: props.transferLink
		}),
		html: render(TransferRequest, {
			props: props
		}).body
	};
}
