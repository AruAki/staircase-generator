<script lang="ts">
	import { clickOutside } from '$lib/directives';
	import { ChevronDown } from '@o7/icon/lucide';
	import { onMount, type Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		value = $bindable(),
		onchange,
		empty_text = 'Select an option',
		class: _class = '',
		containerClass = '',
		title = '',
		children,
		readonly = false,
	}: {
		value: string;
		onchange: (value: string) => void;
		empty_text?: string;
		class?: ClassValue;
		containerClass?: ClassValue;
		title?: string;
		children: Snippet;
		readonly?: boolean;
	} = $props();
	let open: boolean = $state(false);
	let selected: number | null = $state(null);

	let optionsContainer: HTMLDivElement | null = $state(null);
	let openOptions: HTMLDivElement | null = $state(null);
	let options: { value: string; label: string }[] = $derived.by(() => {
		let options: { value: string; label: string }[] = [];
		if (!optionsContainer) return [];
		for (let i = 0; i < optionsContainer.children.length; i++) {
			let option = optionsContainer.children[i] as HTMLOptionElement;
			options.push({ value: option.value, label: option.innerText });
		}
		return options;
	});
	function onclick() {
		if (readonly) return;
		open = !open;
		selected = null;
	}

	onMount(() => {
		document.addEventListener('keydown', keyPressed);
		return () => {
			document.removeEventListener('keydown', keyPressed);
		};
	});
	function keyPressed(e: KeyboardEvent) {
		if (!open) return;
		switch (e.key) {
			case 'Tab':
				e.preventDefault();
				if (selected === null) {
					selected = 0;
				} else {
					selected++;
					if (selected === options.length) {
						open = false;
					}
				}
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (selected === null) {
					selected = 0;
				} else {
					selected = Math.min(selected + 1, options.length - 1);
				}
				if (openOptions) {
					let selectedOptionValue = options[selected]?.value;
					let selectedOptionElement = openOptions.querySelector(
						`#${selectedOptionValue}`,
					);
					if (selectedOptionElement) {
						selectedOptionElement.scrollIntoView({ block: 'nearest' });
					}
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (selected === null) {
					selected = options.length - 1;
				} else {
					selected = Math.max(selected - 1, 0);
				}
				if (openOptions) {
					let selectedOptionValue = options[selected]?.value;
					let selectedOptionElement = openOptions.querySelector(
						`#${selectedOptionValue}`,
					);
					if (selectedOptionElement) {
						selectedOptionElement.scrollIntoView({ block: 'nearest' });
					}
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (selected !== null) {
					onchange(options[selected]!.value);
					open = false;
				}
				break;
			case 'Escape':
				open = false;
				break;
			default:
				e.preventDefault();
				if (e.key === ' ' && searchString === '') {
					open = false;
					return;
				}
				if (!searchDone) {
					if (e.key === 'Backspace') {
						searchString = searchString.slice(0, -1);
					} else {
						searchString += e.key;
					}
					if (searchTimeout) clearTimeout(searchTimeout);
					searchTimeout = setTimeout(searchTimeoutFunction, 500);
				} else {
					searchString = e.key;
					searchDone = false;
					searchTimeout = setTimeout(searchTimeoutFunction, 500);
				}
				let found = options.findIndex((option) =>
					option.label.toLowerCase().startsWith(searchString.toLowerCase()),
				);

				// Find the first option that starts with the search string
				if (found !== -1) {
					selected = found;
					let selectedOptionValue = options[selected]?.value;
					let selectedOptionElement = openOptions?.querySelector(
						`#${selectedOptionValue}`,
					);
					if (selectedOptionElement) {
						selectedOptionElement.scrollIntoView({ block: 'nearest' });
					}
				}
				break;
		}
	}
	let searchString: string = $state('');
	let searchTimeout: number | null = $state(null);
	let searchDone: boolean = $state(false);
	function searchTimeoutFunction() {
		searchString = '';
		searchDone = true;
	}

	function getLabelByValue(value: string) {
		return options.find((option) => option.value === value)?.label || '';
	}

	function willBeOutsideOfViewport() {
		if (!openOptions) return false;

		let rect = openOptions.getBoundingClientRect();
		let top = rect.top;

		return top + rect.height > window.innerHeight;
	}
</script>

<div
	class={`relative w-fit ${containerClass}`}
	use:clickOutside
	onclick_outside={() => (open = false)}
>
	{#if title}
		<span
			class="absolute -top-2 left-2 cursor-default bg-inherit bg-zinc-900 px-1 text-xs font-semibold"
		>
			<span class="pointer-events-none cursor-default text-neutral-400"
				>{title}</span
			>
		</span>
	{/if}
	<button
		class={`flex min-w-24 items-center justify-between gap-2 rounded-md border-2 p-2 text-left focus:border-purple-500 focus:outline-none disabled:cursor-not-allowed ${_class}`}
		{onclick}
		disabled={readonly}
	>
		{#if value === ''}
			{getLabelByValue(value) || empty_text}
		{:else}
			{getLabelByValue(value) || empty_text}
		{/if}
		<ChevronDown
			class={`h-5 w-5 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
		/>
	</button>
	<div bind:this={optionsContainer} class="hidden">
		{@render children()}
	</div>
	{#if open}
		<div
			class={{
				'absolute left-0 z-10 max-h-52 w-full overflow-auto rounded-md border-2 border-zinc-700 bg-zinc-900 pb-0': true,
				'top-full mt-1': !willBeOutsideOfViewport(),
				'bottom-full mb-1': willBeOutsideOfViewport(),
			}}
			bind:this={openOptions}
		>
			{#each options as option, i}
				<button
					class="relative w-full p-2 text-left hover:bg-zinc-950"
					id={option.value}
					class:bg-neutral-200={i === selected}
					onclick={() => {
						onchange(option.value);
						open = false;
					}}
				>
					{option.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
