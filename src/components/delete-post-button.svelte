<script lang="ts">
	import { request_sign_delete_message } from "$lib/messages";
	import { createEventDispatcher } from "svelte";
	import { client } from "$stores/client";
	
	export let message_id: number;
	export let is_reply: boolean;
	export let disabled = false;

	const dispatch = createEventDispatcher();

	async function submit()
		{
		if (disabled)
			return;
		const result = await request_sign_delete_message(message_id, is_reply);
		if (result)
			dispatch("delete_message", {...result, message_id, is_reply});
		}
</script>
<button on:click={submit} disabled={disabled}>Delete</button>