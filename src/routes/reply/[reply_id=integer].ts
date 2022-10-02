import { verify_delete_action } from "$lib/messages";
import { get_reply, delete_reply } from "$lib/database";

/** @type {import('./__types/[id]').RequestHandler} */
export async function DELETE({ request, params }: { request: any, params: any })
	{
	const delete_data = await request.json();
	const { reply_id } = params;
	const reply = await get_reply(reply_id);
	if (!verify_delete_action(reply, delete_data.signature))
		return {status: 400, body: { error: 'invalid_signature' }};
	await delete_reply(reply_id);
	return { status: 200, body: { status: 'ok' } };
	}
