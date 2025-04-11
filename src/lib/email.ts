import nodemailer, { type SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-pool';
import { serverConfig } from '$lib/config/server';

export const emailTransporter = nodemailer.createTransport(serverConfig.smtp);

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
		from: serverConfig.smtp.from,
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
