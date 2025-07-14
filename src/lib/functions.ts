/**
 * Draws a line between two points using Bresenham's algorithm
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function drawLine(
	pixels: string[][],
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	color: string = '#ff0000',
) {
	let dx = Math.abs(x2 - x1);
	let dy = Math.abs(y2 - y1);
	let x = x1;
	let y = y1;
	let sx = x1 > x2 ? -1 : 1;
	let sy = y1 > y2 ? -1 : 1;

	if (dx > dy) {
		let error = dx / 2;
		while (x != x2) {
			drawPixel(pixels, x, y, color);
			error -= dy;
			if (error < 0) {
				y += sy;
				error += dx;
			}
			x += sx;
		}
	} else {
		let error = dy / 2;
		while (y != y2) {
			drawPixel(pixels, x, y, color);
			error -= dx;
			if (error < 0) {
				x += sx;
				error += dy;
			}
			y += sy;
		}
	}
	drawPixel(pixels, x1, y1, color);
}

export function drawPixel(
	pixels: string[][],
	x: number,
	y: number,
	color: string,
	replaceColor: boolean = true,
	specificColor: string = '',
) {
	if (pixels[x] === undefined) {
		pixels[x] = [];
	}
	if (!replaceColor && pixels[x]![y] !== undefined) {
	}
	if (specificColor !== '' && pixels[x]![y] === specificColor) {
		return;
	}
	pixels[x]![y] = color;
}

export function drawCircle(
	pixels: string[][],
	gridSize: number,
	radius: number,
	thickness = 10,
	fill = false,
	drawSegments = false,
	numberOfSegments = 8,
) {
	let cx = gridSize / 2;
	let cy = gridSize / 2;
	for (let x = 0; x <= gridSize; x++) {
		for (let y = 0; y <= gridSize; y++) {
			let radiusSquared = Math.pow(radius, 2);
			let dx = x - cx;
			let dy = y - cy;
			let distSquared = dx * dx + dy * dy;

			if (fill) {
				if (distSquared <= radiusSquared + thickness) {
					drawPixel(pixels, x, y, '#fff');
				}
			} else {
				if (
					radiusSquared - thickness <= distSquared &&
					distSquared <= radiusSquared + thickness
				) {
					drawPixel(pixels, x, y, '#fff');
				}
			}
		}
	}

	if (!drawSegments) return;

	// Draw wedges dividing the circle into segments
	let segmentAngle = 360 / numberOfSegments;
	for (let i = 0; i < numberOfSegments; i++) {
		let startAngle = segmentAngle * i;
		let endAngle = startAngle + segmentAngle;
		let variation = i % 3;
		let color = '#000';
		switch (variation) {
			case 0:
				color = '#dc2626';
				break;
			case 1:
				color = '#22d3ee';
				break;
			case 2:
				color = '#16a34a';
				break;
		}

		// Edge case for when there are exactly 4 segments
		if (i === 3 && numberOfSegments === 4) {
			color = '#22d3ee';
		}

		drawWedge(pixels, cx, cy, radius, startAngle, endAngle, color);
	}
}

export function drawWedge(
	pixels: string[][],
	cx: number,
	cy: number,
	radius: number,
	startAngleDeg: number,
	endAngleDeg: number,
	color: string = genRandomColor(),
) {
	let startRad = (startAngleDeg * Math.PI) / 180;
	let endRad = (endAngleDeg * Math.PI) / 180;

	// Normalize angles to [0, 2π)
	const normalizeAngle = (angle: number) =>
		(angle + 2 * Math.PI) % (2 * Math.PI);

	startRad = normalizeAngle(startRad);
	endRad = normalizeAngle(endRad);

	for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
		for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
			let dx = x - cx;
			let dy = y - cy;

			let distSq = dx * dx + dy * dy;
			if (distSq > radius * radius) continue; // Outside circle

			let angle = Math.atan2(dy, dx);
			angle = normalizeAngle(angle);

			// Check if angle is within wedge
			let inWedge = false;
			if (startRad < endRad) {
				inWedge = angle >= startRad && angle <= endRad;
			} else {
				// Wedge wraps around 0 radians
				inWedge = angle >= startRad || angle <= endRad;
			}

			if (inWedge) {
				drawPixel(pixels, x, y, color, true, '#fff');
			}
		}
	}
}
export function genRandomColor() {
	return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
