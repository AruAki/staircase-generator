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
			return 'transparent';
		}
	}
</script>

<div class="scrollbar flex aspect-square max-w-full flex-col overflow-x-scroll">
	{#each grid as row, i}
		{#if i != 0}
			<div class="flex flex-row">
				{#each row as pixel, j}
					{#if j != 0}
						<Pixel color={pixel} />
					{/if}
				{/each}
			</div>
		{/if}
	{/each}
</div>

<style>
	.scrollbar::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.scrollbar::-webkit-scrollbar-track {
		background: transparent;
		border-radius: 4px;
	}

	.scrollbar::-webkit-scrollbar-thumb {
		background-color: theme('colors.purple.500');
		border-radius: 4px;
		border: 2px solid transparent;
		background-clip: content-box;
	}

	.scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: theme('colors.purple.600');
	}
	.scrollbar::-webkit-scrollbar-corner {
		background: transparent; /* or match your container background */
	}
</style>
