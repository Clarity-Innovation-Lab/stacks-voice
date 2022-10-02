<script lang="ts" context="module">
	import { PUBLIC_NETWORK, PUBLIC_EXPLORER_URL } from "$env/static/public";
	const network = PUBLIC_NETWORK === "mainnet" ? "mainnet" : "testnet";
</script>
<script lang="ts">
	import Hoverable from "./hoverable.svelte";
	import { public_key_to_address, address_to_name_cached } from "$lib/helpers";
	import { remember, hours } from "$lib/cache";

	export let public_key;
	let address, name;
	$: address = public_key_to_address(public_key);
	$: name = address_to_name_cached(address);
</script>
<style>
	span{
		font-size: .75em;
		padding-left: .5em;
	}
</style>
<Hoverable let:hovering>
	<a class="author" href="/author/{public_key}">
		{#await name}
			{address}
		{:then resolved_name}
			{resolved_name || address}
			{#if hovering && resolved_name}
				<span>{address}</span>
			{/if}
		{/await}
	</a>
</Hoverable>