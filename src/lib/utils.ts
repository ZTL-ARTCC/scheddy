import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const ROLE_STUDENT = 10;
export const ROLE_MENTOR = 20;
export const ROLE_STAFF = 30;
export const ROLE_DEVELOPER = 40;

export function roleString(role: number): string {
	if (role >= ROLE_DEVELOPER) {
		return 'Developer';
	} else if (role >= ROLE_STAFF) {
		return 'Facility Staff';
	} else if (role >= ROLE_MENTOR) {
		return 'Training Staff';
	} else if (role >= ROLE_STUDENT) {
		return 'Student';
	} else {
		return 'VATSIM Member';
	}
}

export const RATINGS = {
	S1: 2,
	S2: 3,
	S3: 4,
	C1: 5
};