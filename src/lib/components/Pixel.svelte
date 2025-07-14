<script lang="ts">
	let {
		size = 16,
		color = '#fff',
	}: {
		size?: number;
		color?: string;
	} = $props();

	let clicked: boolean = $state(false);
</script>

<button
	class={{
		'aspect-square border border-zinc-800': true,
		'opacity-50': clicked,
	}}
	style="width: {size}px; height: {size}px; background-color: {color}"
	onclick={() => (clicked = !clicked)}
	aria-hidden="true"
></button>
