<script lang="ts">
	let hovering = false;
</script>
<style>
	div{
		display: inline-block;
	}
</style>
<div on:mouseenter={() => {hovering = true}} on:mouseleave={() => {hovering = false}}>
	<slot hovering={hovering}></slot>
</div>
