export interface NestedMenuItem {
	url: string;
	title: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	visible: boolean;
	isActive?: boolean;
	children?: NestedMenuItem[];
}
