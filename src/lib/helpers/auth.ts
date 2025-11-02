import { serverConfig } from '$lib/config/server';
import { ROLE_DEVELOPER, ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT } from '$lib/utils';

// arbitrary json, structure irrelevant
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function determineHighestRole(vatusa_info: any): number {
	let highest_role = 0;

	// If they're a home controller, give them student perms
	if (vatusa_info.data.facility == serverConfig.facility.id) {
		if (ROLE_STUDENT > highest_role) {
			highest_role = ROLE_STUDENT;
		}
	}

	// If they're a visiting controller, give them student perms
	for (const visiting_facility of vatusa_info.data.visiting_facilities) {
		if (visiting_facility.facility == serverConfig.facility.id && ROLE_STUDENT > highest_role) {
			highest_role = ROLE_STUDENT;
		}
	}

	// Assign staff roles
	// WM: 							ROLE_DEVELOPER
	// ATM, DATM, TA: 	ROLE_STAFF
	// INS, MTR: 				ROLE_MENTOR
	for (const role of vatusa_info.data.roles) {
		if (role.facility == serverConfig.facility.id) {
			let this_role = 0;
			if (role.role == 'WM') {
				this_role = ROLE_DEVELOPER;
			} else if (role.role == 'ATM' || role.role == 'DATM' || role.role == 'TA') {
				this_role = ROLE_STAFF;
			} else if (role.role == 'INS' || role.role == 'MTR') {
				this_role = ROLE_MENTOR;
			}

			if (this_role > highest_role) {
				highest_role = this_role;
			}
		}
	}
	return highest_role;
}