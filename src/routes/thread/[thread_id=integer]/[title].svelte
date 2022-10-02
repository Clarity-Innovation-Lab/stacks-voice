<script lang="ts">
	import { page } from "$app/stores";
	import Thread from "$components/thread.svelte";
	import Reply from "$components/reply.svelte";
	import NewReplyButton from "$components/new-reply-button.svelte";
	import type { Thread } from "$types/thread";
	import { invalidate } from "$app/navigation";

	export let thread: Thread;
	export let replies: Reply[];

	function on_new_reply(event)
		{
		const post = event.detail;
		invalidate();
		// Just reload the page for now. In the future it would be better to 
		// fetch the new post and repopulate the replies array.
		// https://github.com/sveltejs/kit/pull/4536
		window.location.href = `${window.location.href.split('#')[0]}#reply-${post.reply_id}`;
		window.location.reload();
		}
</script>
<Thread {thread} />
{#each replies as reply}
	<Reply {reply}/>
{/each}
<NewReplyButton thread_id={thread.thread_id} on:new_reply={on_new_reply}/>