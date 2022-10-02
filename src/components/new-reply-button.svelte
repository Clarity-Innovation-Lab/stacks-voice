<script lang="ts">
	import { request_sign_message, post_message } from "$lib/messages";
	import { public_key_to_address } from "$lib/helpers";
	import { createEventDispatcher } from "svelte";

	import { slide, fly } from 'svelte/transition';
	import { input_error } from "$transitions/input-error";
	
	export let thread_id;
	export let body = "";

	const dispatch = createEventDispatcher();

	let composing = false;

	let attention = false;
	const attention_params = { duration: 100 };

	async function submit()
		{
		const timestamp = Date.now();
		if (!body)
			{
			attention = !attention;
			return;
			}
		const sign_request = await request_sign_message({thread_id, body, timestamp});
		if (!sign_request)
			return;
		const post = await post_message({thread_id, body, timestamp, author: sign_request.public_key, signature: sign_request.signature });
		dispatch("new_reply", post);
		}
</script>
<style>
	input,textarea{
		display: block;
		box-sizing: border-box;
		width: 100%;
		resize: vertical;
	}
	textarea{
		height: 8em;
	}
</style>
{#if composing}
	<div transition:slide|local>
		{#key attention.body}
			<textarea in:input_error|local={attention_params} placeholder="Message" name="body" bind:value={body}></textarea>
		{/key}
		<button on:click={submit}>Post</button>
	</div>
{/if}
<button on:click={() => {composing = !composing}}>
	{composing ? "Cancel" : "Post reply"}
</button>
