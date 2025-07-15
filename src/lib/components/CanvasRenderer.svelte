<script lang="ts">
	import { untrack } from 'svelte';

	let {
		setPixels = $bindable([]),
	}: {
		setPixels: string[][];
	} = $props();

	const pixelSize: number = 16;
	const borderSize: number = 2;
	let canvas: HTMLCanvasElement | undefined = $state();
	let activatedPixels: boolean[][] = $state([]);
	$effect(() => {
		if (setPixels) {
			untrack(() => (activatedPixels = []));
			untrack(() => draw());
		}
	});

	function draw() {
		if (canvas) {
			let start = Date.now();
			let gridSize = setPixels.length;
			canvas.width = (gridSize - 1) * pixelSize;
			canvas.height = (gridSize - 1) * pixelSize;
			let ctx = canvas.getContext('2d');
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = '#fff';
			// Draw a grid of pixels, each with a
			for (let x = 1; x < gridSize; x++) {
				for (let y = 1; y < gridSize; y++) {
					let color = getPixelColor(x, y);
					if (color === 'transparent') continue;
					drawPixel(ctx, x - 1, y - 1, color);
				}
			}
			console.log(`Draw Took ${Date.now() - start}ms`);
		}
	}
	function canvasClicked(e: MouseEvent) {
		let clickedX: number = e.offsetX;
		let clickedY: number = e.offsetY;

		let x: number = Math.floor(clickedX / pixelSize);
		let y: number = Math.floor(clickedY / pixelSize);

		activatePixel(x, y);
		draw();
	}
	function canvasRightClicked(e: MouseEvent) {
		e.preventDefault();

		let clickedX: number = e.offsetX;
		let clickedY: number = e.offsetY;

		let x: number = Math.floor(clickedX / pixelSize);
		let y: number = Math.floor(clickedY / pixelSize);
		let newState = activatePixel(x, y);
		let color = getPixelColor(x + 1, y + 1);

		// Flood Fill Clicked and all neighboring pixels of the same color to the opposite activation state
		let queue: number[][] = [[x, y]];
		let checkedPixels: string[] = [];
		// let start = Date.now();
		while (queue.length > 0) {
			let xyArr: number[] | undefined = queue.shift();
			if (xyArr === undefined) continue;

			let x = xyArr[0];
			let y = xyArr[1];
			if (x == undefined || y == undefined) continue;

			setActivatePixel(x, y, newState);
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					// Skip self
					if (dx === 0 && dy === 0) continue;
					// Skip diagonals
					if (dx === 1 && dy === 1) continue;
					if (dx === -1 && dy === 1) continue;
					if (dx === 1 && dy === -1) continue;
					if (dx === -1 && dy === -1) continue;

					let newX = x + dx;
					let newY = y + dy;

					if (checkedPixels.includes(`${newX},${newY}`)) continue; // Already checked

					if (
						newX < 0 ||
						newX >= setPixels.length ||
						newY < 0 ||
						newY >= setPixels.length
					)
						continue; // Out of bounds
					checkedPixels.push(`${newX},${newY}`);

					if (getPixelColor(newX + 1, newY + 1) === color) {
						// This pixel is the same color, add it to the queue
						queue.push([newX, newY]);
					}
				}
			}
		}
		// console.log(checkedPixels.length);
		// console.log(`Flood Fill Took ${Date.now() - start}ms`);

		draw();
	}

	function drawPixel(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		color: string,
	) {
		// Draw a pixel at (x, y) with the given color and a border
		ctx.beginPath();
		if (isPixelActivated(x, y)) ctx.globalAlpha = 0.5;
		ctx.fillStyle = color;
		ctx.roundRect(
			x * pixelSize + borderSize,
			y * pixelSize + borderSize,
			pixelSize - borderSize * 2,
			pixelSize - borderSize * 2,
			2,
		);
		ctx.fill();

		// Draw a border
		// ctx.strokeStyle = '#27272a';
		// ctx.lineWidth = borderSize;
		// ctx.roundRect(
		// 	x * pixelSize + borderSize / 2,
		// 	y * pixelSize + borderSize / 2,
		// 	pixelSize - borderSize,
		// 	pixelSize - borderSize,
		// 	roundSize,
		// );
		// ctx.stroke();

		ctx.closePath();
		ctx.globalAlpha = 1;
	}

	function getPixelColor(x: number, y: number): string {
		if (setPixels[x]?.[y] !== undefined) {
			return setPixels[x][y];
		}
		return 'transparent';
	}

	/**
	 * Toggles a pixels activation state
	 * @param x
	 * @param y
	 */
	function activatePixel(x: number, y: number): boolean {
		if (activatedPixels[x]?.[y] === undefined) {
			// This pixel has not been activated at all yet.
			if (activatedPixels[x] === undefined) activatedPixels[x] = [];
			activatedPixels[x][y] = true;
			return true;
		}

		activatedPixels[x][y] = !activatedPixels[x][y];
		return activatedPixels[x][y];
	}
	function setActivatePixel(x: number, y: number, state: boolean) {
		if (activatedPixels[x] === undefined) activatedPixels[x] = [];
		activatedPixels[x][y] = state;
	}
	function isPixelActivated(x: number, y: number): boolean {
		if (activatedPixels[x]?.[y] === undefined) {
			return false;
		}
		return activatedPixels[x][y];
	}
</script>

<div class="max-w-full overflow-x-scroll">
	<canvas
		bind:this={canvas}
		onclick={canvasClicked}
		oncontextmenu={canvasRightClicked}
	></canvas>
</div>
