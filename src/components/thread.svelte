<script lang="ts">
	import Author from "$components/author.svelte";
	import Avatar from "$components/avatar.svelte";
	import DateDisplay from "$components/date-display.svelte";
	import DeletePostButton from "$components/delete-post-button.svelte";
	import { is_welformed_signed_message, delete_thread } from "$lib/messages";
	import { render_markdown, url_safe_subject, object_to_json_data_uri, public_key_to_address } from "$lib/helpers";
	import type { Thread } from "$types/thread";
	import { get_account } from "$stores/client";

	export let thread;
	export let render_body = true;

	const deleted = !thread.signature && !thread.body;
	const valid = !deleted && is_welformed_signed_message(thread);

	const account = get_account();
	// It would be better to compare public keys but it appears that it is not exposed.
	export const author_is_user = $account.stxAddress === public_key_to_address(thread.author);

	function click()
		{
		if (this.href.substring(this.href.length - 9) === "#download")
			this.href = object_to_json_data_uri(thread);
		}

	async function on_delete_message(event)
		{
		const delete_data = event.detail;
		const result = await delete_thread(delete_data.message_id, delete_data.signature);
		window.location.reload();
		}
</script>
<div class="thread post {valid ? "valid" : "invalid"}">
	{#if !deleted}
		{#if valid}
			<a on:click={click} download="{thread.thread_id}.json" href="#download" class="status valid" title="This message is securely verified to have been written by the author. Click here to download the raw message.">Verified</a>
		{:else}
			<a on:click={click} download="{thread.thread_id}.json" href="#download" class="status invalid" title="This message has an invalid signature, be very careful when it comes to the veracity of its contents. Click here to download the raw message.">Invalid signature</a>
		{/if}
	{/if}
	<Avatar public_key={thread.author}/>
	<Author public_key={thread.author}/>
	<DateDisplay timestamp={thread.timestamp}/>
	<h1><a href="/thread/{thread.thread_id}/{url_safe_subject(thread.subject)}">{thread.subject}</a></h1>
	{#if render_body}
		<div class="body">{@html deleted ? "[deleted]" : render_markdown(thread.body)}</div>
		{#if author_is_user && !deleted}
			<DeletePostButton on:delete_message={on_delete_message} message_id={thread.thread_id} is_reply={false}/>
		{/if}
	{/if}
</div>
