<script lang="ts">
	import type { Component } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		value = $bindable(''),
		placeholder = '',
		class: _class = '',
		type = 'text',
		Icon,
		iconFollowsLabel = true,
		labelFocusedClass = 'bg-white',
		readonly = $bindable(false),
		disabled = $bindable(false),
		onchange,
		onkeyup,
	}: {
		value?: string | number;
		placeholder?: string;
		class?: ClassValue;
		Icon?: Component;
		type?: string;
		iconFollowsLabel?: boolean;
		labelFocusedClass?: string;
		readonly?: boolean;
		disabled?: boolean;
		onchange?: (e: any) => void;
		onkeyup?: (e: KeyboardEvent) => void;
	} = $props();

	let focused: boolean = $state(false);
</script>

<div class="relative z-0 w-full">
	{#if placeholder !== '' || Icon}
		<label
			for="input"
			class={{
				'absolute flex flex-row items-center gap-1 px-1 text-base transition-all': true,
				'left-2 top-1/2 -z-10 -translate-y-1/2 bg-transparent':
					!focused && value === '',
				'!left-7': !focused && value === '' && !iconFollowsLabel && Icon,
				'-top-2.5 left-2 z-0 !text-sm': focused || value !== '',
				[labelFocusedClass]: focused || value !== '',
				'text-purple-500': focused,
				'text-neutral-400': !focused,
			}}
		>
			{#if Icon && iconFollowsLabel}
				<Icon
					class={`${focused || value !== '' ? '!h-4 !w-4' : '!h-5 !w-5'} transition-all`}
				/>
			{/if}
			{placeholder}
		</label>
	{/if}
	<input
		{type}
		bind:value
		class={[
			'w-full rounded-md border-2 bg-transparent px-3 py-2 outline-none focus:border-purple-500',
			`${Icon && !iconFollowsLabel ? 'pl-8' : ''}`,
			_class,
		]}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
		{readonly}
		{disabled}
		{onkeyup}
		{onchange}
	/>
	{#if Icon && !iconFollowsLabel}
		<Icon
			class={`absolute left-2.5 top-1/2 -z-10 !w-5 -translate-y-1/2 ${focused ? 'text-purple-500' : 'text-neutral-400'}`}
		/>
	{/if}
</div>

<style>
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
