<script lang="ts">
	import { browser } from '$app/environment';
	import Input from '$lib/components/Input.svelte';
	import Renderer from '$lib/components/Renderer.svelte';
	import { drawCircle } from '$lib/functions';
	import { onMount } from 'svelte';

	let pixels: string[][] = $state([]);
	let mainCircleSize = $state(20);
	let secondCircleSize = $state(10);
	let drawSecondCircle = $state(false);
	let gridSize = $derived.by(() => {
		return mainCircleSize * 2 + 2;
	});
	let numberOfSegments = $state(8);

	onMount(() => {
		if (browser) {
			draw();
		}
	});

	function draw() {
		pixels = [];
		drawCircle(
			pixels,
			gridSize,
			mainCircleSize,
			mainCircleSize,
			false,
			true,
			numberOfSegments,
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
	class="flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-y-scroll"
>
	<h1 class="mb-4 text-4xl">Aru Aki's Staircase Generator</h1>
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
				max="512"
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
