<script lang="ts">
	import { browser } from '$app/environment';
	import Input from '$lib/components/Input.svelte';
	import Renderer from '$lib/components/Renderer.svelte';
	import Select from '$lib/components/Select.svelte';
	import { drawCircle } from '$lib/functions';
	import type { SegmentColoringMethod } from '$lib/types';
	import { Github } from '@o7/icon';
	import { onMount } from 'svelte';

	let pixels: string[][] = $state([]);
	let mainCircleSize = $state(20);
	let secondCircleSize = $state(10);
	let fillSegments = $state(true);
	let segmentColoringMethod: SegmentColoringMethod = $state('colorWheel');
	let drawSecondCircle = $state(false);
	let gridSize = $derived.by(() => {
		return mainCircleSize * 2 + 2;
	});
	let numberOfSegments = $state(8);

	onMount(() => {
		if (browser) {
			mainCircleSize = Number(localStorage.getItem('mainCircleSize')) || 20;
			secondCircleSize = Number(localStorage.getItem('secondCircleSize')) || 10;
			numberOfSegments = Number(localStorage.getItem('numberOfSegments')) || 8;
			segmentColoringMethod = (localStorage.getItem('segmentColoringMethod') ||
				'colorWheel') as SegmentColoringMethod;

			if (localStorage.getItem('fillSegments') === null) {
				fillSegments = true;
				localStorage.setItem('fillSegments', fillSegments.toString());
			}
			fillSegments = localStorage.getItem('fillSegments') === 'true' || false;

			drawSecondCircle =
				localStorage.getItem('drawSecondCircle') === 'true' || false;
			draw();
		}
	});

	function draw() {
		// Save all values to localStorage
		localStorage.setItem('mainCircleSize', mainCircleSize.toString());
		localStorage.setItem('secondCircleSize', secondCircleSize.toString());
		localStorage.setItem('numberOfSegments', numberOfSegments.toString());
		localStorage.setItem('drawSecondCircle', drawSecondCircle.toString());
		localStorage.setItem('fillSegments', fillSegments.toString());
		localStorage.setItem('segmentColoringMethod', segmentColoringMethod);

		pixels = [];
		drawCircle(
			pixels,
			gridSize,
			mainCircleSize,
			mainCircleSize,
			false,
			true,
			segmentColoringMethod,
			numberOfSegments,
			fillSegments,
		);

		if (drawSecondCircle && secondCircleSize > 0) {
			if (secondCircleSize > mainCircleSize) {
				secondCircleSize = mainCircleSize;
			}
			drawCircle(pixels, gridSize, secondCircleSize, secondCircleSize, true);
		}
	}
</script>

<div
	class="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-4"
>
	<h1 class="text-4xl">Aru Aki's Staircase Generator</h1>
	<a
		href="https://github.com/AruAki/staircase-generator"
		class="fixed bottom-1.5 right-3 flex flex-row items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2"
	>
		<Github />
		<span>View on GitHub</span>
	</a>
	<div class="flex flex-col gap-4">
		<div class="flex flex-row gap-2">
			<Input
				type="number"
				value={mainCircleSize}
				placeholder="Main Circle Size"
				labelFocusedClass="bg-zinc-900"
				class="border-zinc-700"
				onchange={(e) => {
					let value = e.target.value;
					if (value === '') {
						value = 16;
					} else {
						value = Number(value);
					}

					mainCircleSize = value;
					if (mainCircleSize < 1) {
						mainCircleSize = 16;
					}
					draw();
				}}
			/>
			<input
				type="range"
				min="1"
				max="50"
				bind:value={mainCircleSize}
				class=""
				onchange={() => {
					draw();
				}}
			/>
		</div>

		<div class="flex flex-row gap-2">
			<Input
				type="number"
				value={numberOfSegments}
				placeholder="Number of Segments"
				labelFocusedClass="bg-zinc-900"
				class="border-zinc-700"
				onchange={(e) => {
					let value = e.target.value;
					if (value === '') {
						value = 0;
					} else {
						value = Number(value);
					}

					numberOfSegments = value;
					draw();
				}}
			/>
			<input
				type="range"
				min="0"
				max="96"
				step="4"
				bind:value={numberOfSegments}
				class=""
				onchange={() => {
					draw();
				}}
			/>
		</div>

		<div class="flex flex-row gap-2">
			<input
				type="checkbox"
				id="fillSegments"
				bind:checked={fillSegments}
				onchange={() => {
					draw();
				}}
			/>
			<label for="fillSegments">Fill Segments?</label>
		</div>

		<div class="flex flex-row gap-2">
			<Select
				value={segmentColoringMethod}
				onchange={(v) => {
					segmentColoringMethod = v as SegmentColoringMethod;
					draw();
				}}
				class="w-full border-zinc-700"
				title="Segment Coloring Method"
				containerClass="w-full"
			>
				<option value="colorWheel">Color Wheel</option>
				<option value="alternating">Alternate</option>
			</Select>
		</div>

		<div class="flex flex-row gap-2">
			<input
				type="checkbox"
				id="drawSecondCircle"
				bind:checked={drawSecondCircle}
				onchange={() => {
					draw();
				}}
			/>
			<label for="drawSecondCircle">Draw Second Circle?</label>
		</div>
		{#if drawSecondCircle}
			<div class="flex flex-row gap-2">
				<Input
					type="number"
					value={secondCircleSize}
					onchange={(e) => {
						let value = e.target.value;
						if (value === '') {
							value = 16;
						} else {
							value = Number(value);
						}
						secondCircleSize = value;
						if (secondCircleSize < 1) {
							secondCircleSize = 8;
						}
						draw();
					}}
					placeholder="Second Circle Size"
					labelFocusedClass="bg-zinc-900"
					class="border-zinc-700"
				/>
				<input
					type="range"
					min="1"
					max={mainCircleSize}
					bind:value={secondCircleSize}
					onchange={() => {
						console.log(drawSecondCircle);
						draw();
					}}
				/>
			</div>
		{/if}
	</div>
	<Renderer bind:size={gridSize} bind:setPixels={pixels} />
</div>

<style>
	input[type='range'] {
		accent-color: theme('colors.purple.500');
	}
</style>
