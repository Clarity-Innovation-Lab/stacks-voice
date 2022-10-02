import { bytesToHex } from "micro-stacks/common";
import type { Reply } from "$types/reply";
import { unserialise_message, is_welformed_signed_message, verify_delete_action } from "$lib/messages";
import { get_thread, get_replies, post_reply, delete_thread } from "$lib/database";
import { TIMESTAMP_TOLERANCE } from "$env/static/private";

const tolerance = TIMESTAMP_TOLERANCE ? parseInt(TIMESTAMP_TOLERANCE) : 120000;

/** @type {import('./__types/[id]').RequestHandler} */
export async function GET({ params }: any)
	{
	const { thread_id, page } = params;
	const thread = await get_thread(thread_id);
	if (thread)
		{
		const thread_converted = {...thread, author: bytesToHex(thread.author as Uint8Array), signature: thread.signature && bytesToHex(thread.signature as Uint8Array)};
		let replies = await get_replies(thread_id, page || 0);
		replies = replies.map(reply => ({...reply, author: bytesToHex(reply.author as Uint8Array), signature: reply.signature && bytesToHex(reply.signature as Uint8Array)}));
		return { status: 200, body: { thread: thread_converted, replies } };
		}
	return { status: 404 };
	}

/** @type {import('./__types/[id]').RequestHandler} */
export async function POST({ request }: { request: any })
	{
	const message = unserialise_message(await request.text()) as Reply;
	if (!message)
		return {status: 400, body: { error: 'invalid_message' }};
	if (!is_welformed_signed_message(message))
		return {status: 400, body: { error: 'invalid_signature' }};
	const now = Date.now();
	if (message.timestamp < now - tolerance || message.timestamp > now + tolerance)
		return {status: 400, body: { error: 'invalid_timestamp' }};
	const reply_id = await post_reply(message);
	if (!reply_id)
		return {status: 500, body: { error: 'reply_failed' }};
	return { status: 200, body: { reply_id } };
	}

/** @type {import('./__types/[id]').RequestHandler} */
export async function DELETE({ request, params }: { request: any, params: any })
	{
	const delete_data = await request.json();
	const { thread_id } = params;
	const thread = await get_thread(thread_id);
	if (!verify_delete_action(thread, delete_data.signature))
		return {status: 400, body: { error: 'invalid_signature' }};
	await delete_thread(thread_id);
	return { status: 200, body: { status: 'ok' } };
	}
