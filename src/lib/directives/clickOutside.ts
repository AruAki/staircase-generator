import type { ActionReturn } from 'svelte/action';

interface Attributes {
	onclick_outside?: (e: CustomEvent<any>) => void;
	'on:click_outside'?: (e: CustomEvent<any>) => void;
}

/** Dispatch event on click outside of node */
export function clickOutside(node: any): ActionReturn<undefined, Attributes> {
	const handleClick = (event: any) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside', node));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
