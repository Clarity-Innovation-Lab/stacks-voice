import { tupleCV, stringUtf8CV, uintCV, stringAsciiCV } from "micro-stacks/clarity";
import { get_client } from "$stores/client";
import type { SignatureData as MicroStacksSignatureData } from "micro-stacks/connect";
import { bytesToHex, ChainID, hexToBytes } from "micro-stacks/common";
import type { Thread } from "$types/thread";
import type { Reply } from "$types/reply";
import { verify_structured_data_signature } from "./structured-data";
import { PUBLIC_APP_NAME, PUBLIC_APP_VERSION, PUBLIC_NETWORK } from "$env/static/public";

export type SignatureData =
	{
	signature: Uint8Array,
	public_key: Uint8Array,
	};

export const domain = {
	name: PUBLIC_APP_NAME,
	version: PUBLIC_APP_VERSION,
	'chain-id': PUBLIC_NETWORK === "mainnet" ? ChainID.Mainnet : ChainID.Testnet,
	};

export const domainCV = tupleCV({
	name: stringAsciiCV(domain.name),
	version: stringAsciiCV(domain.version),
	'chain-id': uintCV(domain['chain-id']),
	});

function signature_data_buffers(data: MicroStacksSignatureData)
	{
	return {
		signature: hexToBytes(data.signature),
		public_key: hexToBytes(data.publicKey),
		};
	}

export function message_date_format(timestamp: number)
	{
	// const date = new Date(timestamp);
	// const now = new Date();
	return `${timestamp}`;
	}

export function message_to_tuple(message: Thread | Reply)
	{
	if ((message as Thread).subject) // message is Thread
		return tupleCV({
			subject: stringUtf8CV((message as Thread).subject),
			body: stringUtf8CV(message.body),
			timestamp: uintCV(message.timestamp)
			});
	return tupleCV({
		body: stringUtf8CV(message.body),
		timestamp: uintCV(message.timestamp),
		thread_id: uintCV(message.thread_id!)
		});
	}

export function delete_action_tuple(message_id: number, is_reply: boolean)
	{
	return tupleCV(
		{
		action: stringAsciiCV("delete"),
		message_id: uintCV(message_id),
		kind: stringAsciiCV(is_reply ? "reply" : "thread")
		});
	}

export function verify_signed_message(message: Thread | Reply)
	{
	if (!message.signature || !message.author)
		return false;
	const author = typeof message.author === "string" ? hexToBytes(message.author): message.author;
	const signature = typeof message.signature === "string" ? hexToBytes(message.signature): message.signature;
	return verify_structured_data_signature(domainCV, message_to_tuple(message), author, signature);
	}

export function verify_delete_action(message: Thread | Reply, signature: Uint8Array | string)
	{
	if (!message.signature || !message.author)
		return false;
	const author = typeof message.author === "string" ? hexToBytes(message.author) : message.author;
	const sig = typeof signature === "string" ? hexToBytes(signature) : signature;
	const is_reply = typeof (message as any).reply_id !== "undefined";
	return verify_structured_data_signature(domainCV, delete_action_tuple(is_reply ? (message as any).reply_id : message.thread_id, is_reply), author, sig);
	}

export async function request_sign_message(message: Thread | Reply): Promise<SignatureData | false>
	{
	if (!message.timestamp)
		message.timestamp = Date.now();
	return new Promise(resolve =>
		get_client().signStructuredMessage(
			{
			message: message_to_tuple(message),
			domain,
			onFinish: (result: MicroStacksSignatureData) => resolve(signature_data_buffers(result)),
			onCancel: () => resolve(false)
			})
		);
	}

export async function request_sign_delete_message(message_id: number, is_reply: boolean): Promise<SignatureData | false>
	{
	return new Promise(resolve =>
		get_client().signStructuredMessage(
			{
			message: delete_action_tuple(message_id, is_reply),
			domain,
			onFinish: (result: MicroStacksSignatureData) => resolve(signature_data_buffers(result)),
			onCancel: () => resolve(false)
			})
		);
	}

export function is_welformed_signed_message(message: Thread | Reply)
	{
	return message.body && message.timestamp && verify_signed_message(message);
	}

export function serialise_message(message: Thread | Reply): string
	{
	const signature = message.signature ? (typeof message.signature !== "string" ? bytesToHex(message.signature) : message.signature) : null;
	const author = message.author? (typeof message.author !== "string" ? bytesToHex(message.author) : message.author) : null;
	return JSON.stringify({ ...message, signature, author });
	}

export function unserialise_message(message_json: string): Thread | Reply | null
	{
	try
		{
		const message = JSON.parse(message_json);
		if (message.signature)
			message.signature = hexToBytes(message.signature);
		if (message.author)
			message.author = hexToBytes(message.author);
		let result: any = { body: message.body, timestamp: message.timestamp, author: message.author, signature: message.signature };
		if (message.subject) // Thread
			result.subject = message.subject;
		else // Reply
			result.thread_id = message.thread_id;
		return result;
		}
	catch (error)
		{
		return null;
		}
	}

export async function post_message(message: Thread | Reply): Promise<any>
	{
	const url = message.thread_id ? `/thread/${message.thread_id}/post` : '/thread';
	const result = await fetch(url, {
		method: "POST",
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json'
			},
		body: serialise_message(message)
		});
	if (!result)
		return false;
	return await result.json();
	}

async function delete_message(message_id: number, signature: Uint8Array, is_reply: boolean): Promise<any>
	{
	const url = !is_reply ? `/thread/${message_id}/delete` : `/reply/${message_id}`;
	const result = await fetch(url, {
		method: "DELETE",
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json'
			},
		body: JSON.stringify({signature: bytesToHex(signature)})
		});
	if (!result)
		return false;
	return await result.json();
	}

export async function delete_thread(thread_id: number, signature: Uint8Array)
	{
	return delete_message(thread_id, signature, false);
	}

export async function delete_reply(reply_id: number, signature: Uint8Array)
	{
	return delete_message(reply_id, signature, true);
	}

