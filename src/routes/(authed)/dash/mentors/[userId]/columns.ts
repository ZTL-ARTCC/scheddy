import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { DateTime } from 'luxon';
import DataTableActions from './DataTableActions.svelte';
import DataTableDateButton from './DataTableDateButton.svelte';

export type CalendarItem = {
	session: {
		id: string;
		start: string;
	};
	sessionType: {
		name: string;
		category: string;
	};
	student: {
		id: number;
		firstName: string;
		lastName: string;
	};
	mentor: {
		id: number;
		firstName: string;
		lastName: string;
	};
};

export const columns: ColumnDef<CalendarItem>[] = [
	{
		accessorKey: 'session.start',
		header: ({ column }) =>
			renderComponent(DataTableDateButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
				isSorted: column.getIsSorted()
			}),
		cell: ({ row }) => {
			return DateTime.fromISO(row.original.session.start).toLocaleString({
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				timeZoneName: 'short'
			});
		}
	},
	{
		accessorKey: 'sessionType.name',
		header: 'Session type'
	},
	{
		id: 'student',
		header: 'Student',
		cell: ({ row }) => {
			return `${row.original.student.firstName} ${row.original.student.lastName}`;
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.session.id,
				mentorId: row.original.mentor.id
			});
		}
	}
];
