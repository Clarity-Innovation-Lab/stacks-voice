import { get_thread } from "$lib/database";
import { bytesToHex, hexToBytes } from "micro-stacks/common";
import { get_latest_threads } from "$lib/database";

/** @type {import('./__types/[public_key]').RequestHandler} */
export async function GET({ params }: any)
	{
	const { public_key } = params;
	if (public_key)
		{
		let latest_threads = await get_latest_threads(10, hexToBytes(public_key));
		latest_threads = latest_threads.map(thread => ({...thread, author: bytesToHex(thread.author), signature: thread.signature && bytesToHex(thread.signature)}))
		return { status: 200, body: { author: public_key, latest_threads } };
		}
	return { status: 404 };
	}
