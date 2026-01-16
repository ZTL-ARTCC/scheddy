import type { Icon } from '@lucide/svelte';
export interface NestedMenuItem {
	url: string;
	title: string;
	icon?: typeof Icon;
	visible: boolean;
	isActive?: boolean;
	children?: NestedMenuItem[];
}
