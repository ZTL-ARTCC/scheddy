<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props {
		children: Snippet;
		href: string | undefined;
		variant: 'normal' | 'danger' | 'tableCreateAction' | 'ghost' | 'formSubmit';
		size: 'icon' | 'sm' | 'md';
		class: ClassValue | ClassValue[];
	}
	let {
		children,
		href = undefined,
		variant = 'normal',
		size = 'md',
		class: className = '',
		...rest
	}: Props & HTMLAttributes<HTMLButtonElement> = $props();

	const base = 'inline-block text-center rounded font-bold transition';
	const variants = {
		normal: 'bg-blue-500 text-blue-950 hover:bg-blue-600 shadow-sm disabled:bg-gray-500',
		danger: 'bg-red-500 text-red-950 hover:bg-red-600 shadow-sm disabled:bg-gray-500',
		ghost: 'hover:text-blue-500 hover:bg-blue-500/30 disabled:text-gray-500',
		tableCreateAction:
			'bg-blue-500 text-blue-950 hover:bg-blue-600 flex flex-row p-2 float-right align-top shadow-sm disabled:bg-gray-500',
		formSubmit:
			'bg-blue-500 text-blue-950 hover:bg-blue-600 shadow-sm min-w-24 text-center justify-center items-center flex flex-row disabled:bg-gray-500'
	};
	const sizes = {
		icon: 'p-2',
		sm: 'px-4 py-2',
		md: 'p-4'
	};

	let mergedClassName = cn(base, sizes[size], variants[variant], className);
</script>

{#if href}
	<a class={mergedClassName} {href}>
		{@render children()}
	</a>
{:else}
	<button {...rest} class={mergedClassName}>
		{@render children()}
	</button>
{/if}
