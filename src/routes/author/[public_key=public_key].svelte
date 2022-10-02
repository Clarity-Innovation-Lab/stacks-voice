<script>
	import Author from "$components/author.svelte";
	import Avatar from "$components/avatar.svelte";
	import Thread from "$components/thread.svelte";

	export let author;
	export let latest_threads;
</script>
Profile of <Author public_key={author}/>
<Avatar public_key={author}/>
<h1>Latest threads</h1>
{#each latest_threads as thread}
	<Thread {thread} render_body={false}/>
{/each}
