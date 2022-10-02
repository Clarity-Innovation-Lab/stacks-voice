<script lang="ts">
	import { mountClient, getMicroStacksClient } from "@micro-stacks/svelte";
	import { client } from "$stores/client";
	import { PUBLIC_APP_NAME } from "$env/static/public";

	mountClient({
		appName: PUBLIC_APP_NAME,
		appIconUrl: '/favicon.png'
	});

	client.set(getMicroStacksClient());
</script>
<nav>
	<a href="/">Home</a>
</nav>
<slot/>
