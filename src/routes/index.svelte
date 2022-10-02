<script lang="ts">
	import ConnectButton from "$components/connect-button.svelte";
	import UserDisplay from "$components/user-display.svelte";
	import NewThreadButton from "$components/new-thread-button.svelte";
	import Thread from "$components/thread.svelte";
	import { public_key_to_address, url_safe_subject } from "$lib/helpers";

	import { goto } from "$app/navigation";

	export let latest_threads;

	function on_new_thread(event)
		{
		const post = event.detail;
		goto(`/thread/${post.thread_id}/${url_safe_subject(post.subject)}`);
		}
</script>
<ConnectButton/>
<NewThreadButton on:new_thread={on_new_thread}/>
{#each latest_threads as thread}
	<Thread {thread} render_body={false}/>
{/each}
