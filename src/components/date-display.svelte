<script lang="ts" context="module">
	import { writable } from "svelte/store";
    const toggle = writable(false);

	function click()
		{
		toggle.update(b => !b);
		}
</script>
<script lang="ts">
	import { render_markdown, url_safe_subject, timestamp_to_relative_date, timestamp_to_date } from "$lib/helpers";
	export let timestamp;
</script>
<span on:click={click} title={timestamp_to_date(timestamp)}>{$toggle ? timestamp_to_date(timestamp) : timestamp_to_relative_date(timestamp)}</span>