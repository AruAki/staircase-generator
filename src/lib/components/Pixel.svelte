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
	class={{ 'aspect-square border': true, 'border-2 border-black': clicked }}
	style="width: {size}px; height: {size}px; background-color: {color}"
	onclick={() => (clicked = true)}
	aria-hidden="true"
></button>
