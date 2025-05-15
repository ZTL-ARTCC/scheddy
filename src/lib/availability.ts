export interface MentorAvailability {
	sunday: DayAvailability;
	monday: DayAvailability;
	tuesday: DayAvailability;
	wednesday: DayAvailability;
	thursday: DayAvailability;
	friday: DayAvailability;
	saturday: DayAvailability;
	exceptions: Record<string, ExceptionAvailability>;
}

export interface DayAvailability {
	available: boolean;
	slots: { start: Time; end: Time }[];
}

export interface ExceptionAvailability extends DayAvailability {
	slots: { available: boolean; start: Time; end: Time }[];
}
export interface Time {
	hour: number;
	minute: number;
}
