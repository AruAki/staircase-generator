<script lang="ts">
	import Pixel from '$lib/components/Pixel.svelte';
	let {
		size = $bindable(16),
		setPixels = $bindable([]),
	}: {
		size: number;
		setPixels: string[][];
	} = $props();

	// let grid: string[][] = $state([]);
	let grid: string[][] = $derived.by(() => {
		let _grid: string[][] = [];
		for (let i = 0; i < size; i++) {
			let row: string[] = [];
			for (let j = 0; j < size; j++) {
				row.push(getPixelColor(i, j));
			}
			_grid.push(row);
		}
		return _grid;
	});

	// Returns the color of a pixel if it is contained in the setPixels array
	function getPixelColor(x: number, y: number): string {
		if (setPixels[x]?.[y] !== undefined) {
			return setPixels[x][y];
		} else {
			return '#aaa';
		}
	}
</script>

<div class="flex aspect-square flex-col overflow-scroll">
	{#each grid as row, i}
		<div class="flex flex-row">
			{#each row as pixel, j}
				<Pixel color={pixel} />
			{/each}
		</div>
	{/each}
</div>
