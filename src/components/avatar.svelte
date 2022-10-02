<script lang="ts">
	export let public_key;

	// Some logic would go here to pull an NFT profile picture or
	// similar. For now, just a colour hash.
	const byte = parseInt(public_key.substring(4,6),16);
	const colour = `hsl(${~~(byte/255*100)}, 50%, 50%)`;
	const style = `background-color: ${colour}`;
</script>
<div class="avatar" {style}></div>