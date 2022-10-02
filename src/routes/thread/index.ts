import type { Thread } from "$types/thread";
import { unserialise_message, is_welformed_signed_message } from "$lib/messages";
import { post_thread } from "$lib/database";
import { TIMESTAMP_TOLERANCE } from "$env/static/private";

const tolerance = TIMESTAMP_TOLERANCE ? parseInt(TIMESTAMP_TOLERANCE) : 120000;

/** @type {import('./__types/thread').RequestHandler} */
export async function POST({ request }: { request: any })
	{
	const message = unserialise_message(await request.text()) as Thread;
	if (!message)
		return {status: 400, body: { error: 'invalid_message' }};
	if (!message.subject || !is_welformed_signed_message(message))
		return {status: 400, body: { error: 'invalid_signature' }};
	const now = Date.now();
	if (message.timestamp < now - tolerance || message.timestamp > now + tolerance)
		return {status: 400, body: { error: 'invalid_timestamp' }};
	const thread_id = await post_thread(message);
	if (!thread_id)
		return {status: 500, body: { error: 'post_failed' }};
	return { status: 200, body: { thread_id } };
	}