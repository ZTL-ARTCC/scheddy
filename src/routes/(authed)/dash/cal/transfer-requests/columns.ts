import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableMentor from '../DataTableMentor.svelte';
import { DateTime } from 'luxon';
import DataTableActions from './DataTableActions.svelte';
import DataTableDateButton from '../DataTableDateButton.svelte';

export type CalendarItem = {
	session: {
		id: string;
		start: string;
	};
	sessionType: {
		name: string;
		category: string;
	};
	oldMentor: {
		id: number;
		firstName: string;
		lastName: string;
	};
	newMentor: {
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
		id: 'oldMentor',
		header: 'Old Mentor',
		cell: ({ row }) => {
			return renderComponent(DataTableMentor, row.original.oldMentor);
		}
	},
	{
		id: 'newMentor',
		header: 'New Mentor',
		cell: ({ row }) => {
			return renderComponent(DataTableMentor, row.original.newMentor);
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.session.id,
				oldMentorId: row.original.oldMentor.id,
				newMentorId: row.original.newMentor.id
			});
		}
	}
];
