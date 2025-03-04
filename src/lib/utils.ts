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

export const RATINGS = [
	{ id: 0, short: 'SUS or higher', long: 'Any' },
	{ id: 1, short: 'OBS', long: 'Observer' },
	{ id: 2, short: 'S1', long: 'Student 1' },
	{ id: 3, short: 'S2', long: 'Student 2' },
	{ id: 4, short: 'S3', long: 'Student 3' },
	{ id: 5, short: 'C1', long: 'Enroute Controller' },
	{ id: 7, short: 'C3', long: 'Senior Controller' },
	{ id: 8, short: 'I1', long: 'Instructor' },
	{ id: 10, short: 'I3', long: 'Senior Instructor' }
];
export function ratingIdLookup(id: number): { id: number; short: string; long: string } | null {
	for (const rating of RATINGS) {
		if (rating.id === id) return rating;
	}
	return null;
}

export function ratingIdDisplay(id: number): string | null {
	const data = ratingIdLookup(id);
	if (!data) return null;
	return `${data.long} (${data.short})`;
}
