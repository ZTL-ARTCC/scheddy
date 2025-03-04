import type { ColumnDef } from '@tanstack/table-core';
import { roleString } from '$lib/utils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './DataTableActions.svelte';
import DataTableAddButton from './DataTableAddButton.svelte';

export type TUser = {
	id: number;
	firstName: string;
	lastName: string;
	role: number;
	roleOverride: number;
};

export const userColumns: ColumnDef<TUser>[] = [
	{
		id: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return row.original.firstName + ' ' + row.original.lastName;
		}
	},
	{
		id: 'role',
		header: 'VATUSA Role',
		cell: ({ row }) => {
			return roleString(row.original.role);
		}
	},
	{
		id: 'roleOverride',
		header: 'Role Override',
		cell: ({ row }) => {
			return roleString(row.original.roleOverride);
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				roleOverride: row.original.roleOverride
			});
		},
		header: () => {
			return renderComponent(DataTableAddButton, {});
		}
	}
];
