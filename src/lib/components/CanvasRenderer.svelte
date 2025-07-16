<script lang="ts">
	import { untrack } from 'svelte';

	let {
		setPixels = $bindable([]),
	}: {
		setPixels: string[][];
	} = $props();

	const DEBUG: boolean = false;
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

			// Draw a grid of pixels, each with a
			for (let x = 1; x < gridSize; x++) {
				for (let y = 1; y < gridSize; y++) {
					let color = getPixelColor(x, y);
					if (color === 'transparent') continue;
					drawPixel(ctx, x - 1, y - 1, color);
				}
			}
			if (DEBUG) console.log(`Draw Took ${Date.now() - start}ms`);
		}
	}
	function canvasClicked(e: MouseEvent) {
		let clickedX: number = e.offsetX;
		let clickedY: number = e.offsetY;

		let x: number = Math.floor(clickedX / pixelSize);
		let y: number = Math.floor(clickedY / pixelSize);

		activatePixel(x, y);

		let start = Date.now();
		if (!canvas) return;
		let ctx = canvas.getContext('2d');
		if (!ctx) return;
		drawPixel(ctx, x, y, getPixelColor(x + 1, y + 1), true);
		if (DEBUG) console.log(`Redraw Took ${Date.now() - start}ms`);
	}
	function canvasRightClicked(e: MouseEvent) {
		e.preventDefault();

		if (!canvas) return;
		let ctx = canvas.getContext('2d');
		if (!ctx) return;

		let clickedX: number = e.offsetX;
		let clickedY: number = e.offsetY;

		let x: number = Math.floor(clickedX / pixelSize);
		let y: number = Math.floor(clickedY / pixelSize);
		let newState = !isPixelActivated(x, y);
		let color = getPixelColor(x + 1, y + 1);

		let start = Date.now();
		// Scanline Flood Fill
		let queue: number[][] = [[x, y]]; // Queue of y coordinates to check
		while (queue.length > 0) {
			let [x, y]: any = queue.pop();
			if (x === undefined || y === undefined) continue;

			// Move left until edge of canvas or color.
			let leftx = x;
			while (
				leftx >= 0 &&
				getPixelColor(leftx + 1, y + 1) === color &&
				isPixelActivated(leftx, y) !== newState
			)
				leftx--;
			leftx++;

			let spanAbove = false;
			let spanBelow = false;

			// Move right from left boundary, filling and checking neighbors
			let rightx = leftx;
			while (
				rightx < setPixels.length &&
				getPixelColor(rightx + 1, y + 1) === color &&
				isPixelActivated(rightx, y) !== newState
			) {
				setActivatePixel(rightx, y, newState);
				drawPixel(ctx, rightx, y, color, true); // Redraw the pixel

				// Check Pixel above
				if (y > 0 && getPixelColor(rightx + 1, y - 1 + 1) === color) {
					if (!spanAbove) {
						queue.push([rightx, y - 1]);
						spanAbove = true;
					}
				} else {
					spanAbove = false;
				}

				// Check Pixel below
				if (
					y < setPixels.length - 1 &&
					getPixelColor(rightx + 1, y + 2) === color
				) {
					if (!spanBelow) {
						queue.push([rightx, y + 1]);
						spanBelow = true;
					}
				} else {
					spanBelow = false;
				}

				rightx++;
			}
		}

		setActivatePixel(x, y, newState);
		drawPixel(ctx, x, y, color, true); // Redraw the pixel
		if (DEBUG) console.log(`Flood Fill + Redraw Took ${Date.now() - start}ms.`);
	}

	function drawPixel(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		color: string,
		redraw: boolean = false,
	) {
		// Draw a pixel at (x, y) with the given color and a border
		ctx.beginPath();
		if (redraw)
			ctx.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
		if (color === 'transparent') return;
		ctx.fillStyle = color;
		if (isPixelActivated(x, y)) ctx.globalAlpha = 0.4;
		ctx.roundRect(
			x * pixelSize + borderSize,
			y * pixelSize + borderSize,
			pixelSize - borderSize * 2,
			pixelSize - borderSize * 2,
			2,
		);
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	function getPixelColor(x: number, y: number): string {
		return setPixels[x]?.[y] || 'transparent';
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
