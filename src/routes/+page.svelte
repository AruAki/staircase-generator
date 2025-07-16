<script lang="ts">
	import { browser } from '$app/environment';
	import CanvasRenderer from '$lib/components/CanvasRenderer.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { drawCircle, drawSegments } from '$lib/functions';
	import type { SegmentColoringMethod } from '$lib/types';
	import { onMount } from 'svelte';

	let pixels: string[][] = $state([]);
	let mainCircleSize = $state(20);
	let thinCorners = $state(true);
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
			thinCorners = localStorage.getItem('thinCorners') === 'true' || false;
			secondCircleSize = Number(localStorage.getItem('secondCircleSize')) || 10;
			let _numberOfSegments = localStorage.getItem('numberOfSegments');
			if (_numberOfSegments === null) {
				_numberOfSegments = '8';
			}
			numberOfSegments = parseInt(_numberOfSegments);
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
		localStorage.setItem('thinCorners', thinCorners.toString());
		localStorage.setItem('secondCircleSize', secondCircleSize.toString());
		localStorage.setItem('numberOfSegments', numberOfSegments.toString());
		localStorage.setItem('drawSecondCircle', drawSecondCircle.toString());
		localStorage.setItem('fillSegments', fillSegments.toString());
		localStorage.setItem('segmentColoringMethod', segmentColoringMethod);

		pixels = [];
		drawCircle(pixels, gridSize, mainCircleSize, false, thinCorners);
		drawSegments(
			pixels,
			gridSize,
			mainCircleSize,
			numberOfSegments,
			fillSegments,
			segmentColoringMethod,
		);

		if (drawSecondCircle && secondCircleSize > 0) {
			if (secondCircleSize > mainCircleSize) {
				secondCircleSize = mainCircleSize;
			}
			drawCircle(pixels, gridSize, secondCircleSize, true);
		}
	}
</script>

<svelte:head>
	<title>Aru Aki's Spiral & Curved Staircase Generator</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col items-center gap-6 p-4">
	<h1 class="text-center text-4xl">Spiral & Curved Staircase Generator</h1>
	<div class="flex flex-col gap-6 border-b border-zinc-700 pb-4">
		<div class="flex flex-col items-end gap-4 md:flex-row">
			<div class="flex flex-col gap-3">
				<div class="ml-1 flex flex-row gap-2">
					<input
						type="checkbox"
						id="thinCorners"
						bind:checked={thinCorners}
						onchange={() => {
							draw();
						}}
					/>
					<label for="thinCorners">Thin Corners?</label>
				</div>
				<div class="flex flex-row gap-2">
					<Input
						type="number"
						value={mainCircleSize}
						placeholder="Circle Radius"
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
			</div>
			<div class="flex flex-col gap-3">
				<div class="ml-1 flex flex-row gap-2">
					<input
						type="checkbox"
						id="drawSecondCircle"
						bind:checked={drawSecondCircle}
						onchange={() => {
							draw();
						}}
					/>
					<label for="drawSecondCircle">Draw Secondary Circle?</label>
				</div>
				<div class="flex flex-row gap-2">
					<Input
						type="number"
						value={secondCircleSize}
						disabled={!drawSecondCircle}
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
						placeholder="Secondary Circle Radius"
						labelFocusedClass="bg-zinc-900"
						class="border-zinc-700"
					/>
					<input
						type="range"
						min="1"
						max={mainCircleSize - 1}
						bind:value={secondCircleSize}
						disabled={!drawSecondCircle}
						onchange={() => {
							draw();
						}}
					/>
				</div>
			</div>
		</div>

		<div class="flex w-full flex-col items-start gap-4 md:flex-row">
			<div class="flex flex-col gap-2">
				<div class="flex flex-1 flex-row gap-2">
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
						onchange={() => {
							draw();
						}}
					/>
				</div>
				<div class="ml-1 flex flex-row gap-2">
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
			</div>
			<div class="flex w-full flex-1 flex-row gap-2">
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
					<option value="colorWheel">Van der Corput</option>
					<option value="alternating">Alternate</option>
				</Select>
			</div>
		</div>
	</div>
	<CanvasRenderer bind:setPixels={pixels} />
</div>
