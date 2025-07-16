<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	const { children } = $props();
</script>

{@render children()}
<Footer />
