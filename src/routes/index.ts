import { post_thread, get_latest_threads } from "$lib/database";
import { bytesToHex } from "micro-stacks/common";

/** @type {import('./__types/index').RequestHandler} */
export async function GET({ params }: any)
	{
	const { thread_id } = params;
	const latest_threads = await get_latest_threads();
	if (latest_threads)
		{
		const latest_threads_converted = latest_threads.map(thread => ({...thread, author: bytesToHex(thread.author), signature: thread.signature && bytesToHex(thread.signature)}));
		return { status: 200, body: { latest_threads: latest_threads_converted } };
		}
	return { status: 200, body: { latest_threads: []} };
	}
