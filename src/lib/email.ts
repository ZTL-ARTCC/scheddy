import nodemailer, { type SendMailOptions } from 'nodemailer';
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_SECURE,
	SMTP_AUTH_USER,
	SMTP_AUTH_PASS,
	SMTP_EMAIL_FROM
} from '$env/static/private';
import type SMTPTransport from 'nodemailer/lib/smtp-pool';

export const emailTransporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: SMTP_SECURE === 'true',
	auth: {
		user: SMTP_AUTH_USER,
		pass: SMTP_AUTH_PASS
	}
});

export interface EmailContent {
	raw: string;
	html: string;
}

export function templateOut(src: string, data: Record<string, string>): string {
	let out = src;
	for (const [k, v] of Object.entries(data)) {
		out = out.replaceAll(`{${k}}`, v);
	}
	return out;
}

/**
 * Send an email.
 *
 * The first 4 parameters are required; callers can optionally supply
 * the `ics` parameter to include an .ics file in the email attachments.
 */
export async function sendEmail(
	to: string,
	subject: string,
	plaintext: string,
	html: string,
	ics?: string
): Promise<SMTPTransport.SentMessageInfo> {
	const options: SendMailOptions = {
		from: SMTP_EMAIL_FROM,
		to: to,
		subject,
		text: plaintext,
		html
	};
	if (ics) {
		options.attachments = [
			{
				filename: 'event.ics',
				content: ics
			}
		];
	}
	return emailTransporter.sendMail(options);
}
