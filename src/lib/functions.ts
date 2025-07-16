import type { SegmentColoringMethod } from './types';

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

	const errorConstant = 2;
	if (dx > dy) {
		let error = dx / errorConstant;
		while (x != x2) {
			drawPixel(pixels, x, y, color, true, '#fff');
			error -= dy;
			if (error < 0) {
				y += sy;
				error += dx;
			}
			x += sx;
		}
	} else {
		let error = dy / errorConstant;
		while (y != y2) {
			drawPixel(pixels, x, y, color, true, '#fff');
			error -= dx;
			if (error < 0) {
				x += sx;
				error += dy;
			}
			y += sy;
		}
	}
	drawPixel(pixels, x1, y1, color); // Draw the final pixel
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
		return;
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
	fill = false,
	thinCorners = true,
) {
	let cx = gridSize / 2;
	let cy = gridSize / 2;

	let circlePixels: string[][] = [];
	for (let x = 0; x <= gridSize; x++) {
		for (let y = 0; y <= gridSize; y++) {
			let radiusSquared = Math.pow(radius, 2);
			let dx = x - cx;
			let dy = y - cy;
			let distSquared = dx * dx + dy * dy;

			if (fill) {
				if (distSquared <= radiusSquared + radius) {
					if (circlePixels[x] === undefined) {
						circlePixels[x] = [];
					}
					circlePixels[x]![y] = '#fff';
				}
			} else {
				if (
					radiusSquared - radius <= distSquared &&
					distSquared <= radiusSquared + radius
				) {
					if (circlePixels[x] === undefined) {
						circlePixels[x] = [];
					}
					circlePixels[x]![y] = '#fff';
				}
			}
		}
	}

	circlePixels.forEach((row, x) => {
		if (row === undefined) return;
		row.forEach((color, y) => {
			if (thinCorners && x !== cx && y !== cy && !fill) {
				// Thin circle, remove any pixel that has 2 neighbors that are occupied

				// Determine the quadrant the pixel is in, to determine which directions to check for corners
				let quadrant: number = 0;
				if (x > cx && y > cy) {
					quadrant = 0; // Bottom Right
				} else if (x > cx && y < cy) {
					quadrant = 1; // Top Right
				} else if (x < cx && y < cy) {
					quadrant = 2; // Top Left
				} else if (x < cx && y > cy) {
					quadrant = 3; // Bottom Left
				}

				let isCorner = false;
				switch (quadrant) {
					case 0: // Bottom Right
						if (
							circlePixels[x]?.[y - 1] === color &&
							circlePixels[x - 1]?.[y] === color &&
							circlePixels[x + 1]?.[y] === undefined &&
							circlePixels[x]?.[y + 1] === undefined
						) {
							isCorner = true;
						}
						break;
					case 1: // Top Right
						if (
							circlePixels[x]?.[y + 1] === color &&
							circlePixels[x - 1]?.[y] === color &&
							circlePixels[x + 1]?.[y] === undefined &&
							circlePixels[x]?.[y - 1] === undefined
						) {
							isCorner = true;
						}
						break;
					case 2: // Top Left
						if (
							circlePixels[x]?.[y + 1] === color &&
							circlePixels[x + 1]?.[y] === color &&
							circlePixels[x - 1]?.[y] === undefined &&
							circlePixels[x]?.[y - 1] === undefined
						) {
							isCorner = true;
						}
						break;
					case 3: // Bottom Left
						if (
							circlePixels[x]?.[y - 1] === color &&
							circlePixels[x + 1]?.[y] === color &&
							circlePixels[x - 1]?.[y] === undefined &&
							circlePixels[x]?.[y + 1] === undefined
						) {
							isCorner = true;
						}
						break;
				}
				if (isCorner) {
					// Delete this pixel
					circlePixels[x]!.slice(y, 1);
					return;
				}
			}
			drawPixel(pixels, x, y, color);
		});
	});
}

export function drawSegments(
	pixels: string[][],
	gridSize: number,
	radius: number,
	numberOfSegments: number,
	fillWedges: boolean,
	segmentColoringMethod: SegmentColoringMethod,
) {
	if (!drawSegments || numberOfSegments === 0) return;
	let cx = gridSize / 2;
	let cy = gridSize / 2;

	// Draw wedges dividing the circle into segments
	let segmentAngle = 360 / numberOfSegments;

	for (let i = 0; i < numberOfSegments; i++) {
		let color = '#000';
		let variation = i % 3;
		if (segmentColoringMethod === 'alternating') {
			switch (variation) {
				case 0:
					color = '#dc2626';
					break;
				case 1:
					color = '#22d3ee';
					break;
				case 2:
					color = '#a3e635';
					break;
			}
			// Edge case for when there are exactly 4 segments
			if (i === 3 && numberOfSegments === 4) {
				color = '#22d3ee';
			}
		}
		if (segmentColoringMethod === 'colorWheel') {
			color = getColorWheel(i, numberOfSegments);
		}
		if (fillWedges) {
			let startAngle = segmentAngle * i;
			let endAngle = startAngle + segmentAngle;

			drawWedge(pixels, cx, cy, radius, startAngle, endAngle, color);
		} else {
			//Draw lines from the center to the edges of the circle
			let theta = (segmentAngle * i * Math.PI) / 180;
			let x = cx + radius * Math.cos(theta);
			let y = cy + radius * Math.sin(theta);

			drawLine(
				pixels,
				cx,
				cy,
				Math.round(x),
				Math.round(y),
				segmentColoringMethod === 'colorWheel' ? color : '#ff0000',
			);
		}
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

function HSVtoRGB(h: number, s: number, v: number) {
	var r, g, b, i, f, p, q, t;
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			((r = v), (g = t), (b = p));
			break;
		case 1:
			((r = q), (g = v), (b = p));
			break;
		case 2:
			((r = p), (g = v), (b = t));
			break;
		case 3:
			((r = p), (g = q), (b = v));
			break;
		case 4:
			((r = t), (g = p), (b = v));
			break;
		case 5:
			((r = v), (g = p), (b = q));
			break;
	}
	return {
		r: Math.round(r! * 255),
		g: Math.round(g! * 255),
		b: Math.round(b! * 255),
	};
}
function RGBtoHEX(r: number, g: number, b: number) {
	return `#${NumberToHex(r)}${NumberToHex(g)}${NumberToHex(b)}`;
}
function NumberToHex(n: number) {
	return n.toString(16).padStart(2, '0');
}

function vanDerCorput(n: number, base: number = 2): number {
	let vdc = 0,
		denom = 1;
	while (n > 0) {
		denom *= base;
		vdc += (n % base) / denom;
		n = Math.floor(n / base);
	}
	return vdc;
}

function getColorWheel(n: number, total: number) {
	n = n % (total / 2); // Prevent colors from wrapping around and being the same color

	let hue = vanDerCorput(n) * 360;
	let rgb = HSVtoRGB(hue / 360, 1, 1);
	return RGBtoHEX(rgb.r, rgb.g, rgb.b);
}
