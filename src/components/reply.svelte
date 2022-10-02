<script lang="ts">
	import Author from "$components/author.svelte";
	import Avatar from "$components/avatar.svelte";
	import DeletePostButton from "$components/delete-post-button.svelte";
	import DateDisplay from "$components/date-display.svelte";
	import type { Reply } from "$types/reply";
	import { is_welformed_signed_message } from "$lib/messages";
	import { render_markdown, url_safe_subject, object_to_json_data_uri, public_key_to_address } from "$lib/helpers";
	import { delete_reply } from "$lib/messages";
	import { get_account } from "$stores/client";

	export let reply;

	const deleted = !reply.signature && !reply.body;
	const valid = !deleted && is_welformed_signed_message(reply);

	const account = get_account();
	// It would be better to compare public keys but it appears that it is not exposed.
	export const author_is_user = $account.stxAddress === public_key_to_address(reply.author);

	function click()
		{
		if (this.href.substring(this.href.length - 9) === "#download")
			this.href = object_to_json_data_uri(reply);
		}

	async function on_delete_message(event)
		{
		const delete_data = event.detail;
		const result = await delete_reply(delete_data.message_id, delete_data.signature);
		window.location.reload();
		}
</script>
<div class="reply post {valid ? "valid" : "invalid"}" id="reply-{reply.reply_id}">
	{#if !deleted}
		{#if valid}
			<a on:click={click} download="{reply.reply_id}.json" href="#download" class="status valid" title="This message is securely verified to have been written by the author. Click here to download the raw message.">Verified</a>
		{:else}
			<a on:click={click} download="{reply.reply_id}.json" href="#download" class="status invalid" title="This message has an invalid signature, be very careful when it comes to the veracity of its contents. Click here to download the raw message.">Invalid signature</a>
		{/if}
	{/if}
	<Avatar public_key={reply.author}/>
	<Author public_key={reply.author}/>
	<DateDisplay timestamp={reply.timestamp}/>
	<div class="body">{@html deleted ? "[deleted]" : render_markdown(reply.body)}</div>
	{#if author_is_user && !deleted}
		<DeletePostButton on:delete_message={on_delete_message} message_id={reply.reply_id} is_reply={true}/>
	{/if}
</div>
