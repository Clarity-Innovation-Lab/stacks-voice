import { StacksNetworkVersion } from "micro-stacks/crypto";
import { addressFromPublicKeys, AddressHashMode, type StacksPublicKey } from "micro-stacks/transactions";
import { PUBLIC_NETWORK } from "$env/static/public"
import { addressToString, StacksMessageType } from "micro-stacks/clarity";
import { fetchNamesByAddress } from "micro-stacks/api";
import { hexToBytes } from "micro-stacks/common";
import { marked } from "marked";
import { hours, remember} from "$lib/cache";

const MAINNET = PUBLIC_NETWORK === "mainnet";
const API_URL = MAINNET ? "https://stacks-node-api.mainnet.stacks.co" : "https://stacks-node-api.testnet.stacks.co";

export function single_network_version()
	{
	return MAINNET ? StacksNetworkVersion.mainnetP2PKH : StacksNetworkVersion.testnetP2PKH;
	}

export function public_key_to_address(public_key: Uint8Array | string)
	{
	const pubkey: StacksPublicKey = {
		type: StacksMessageType.PublicKey,
		data: typeof public_key === "string" ? hexToBytes(public_key) : public_key,
		};
	const address = addressFromPublicKeys(single_network_version(), AddressHashMode.SerializeP2PKH, 1, [pubkey]);
	return addressToString(address);
	}

export function url_safe_subject(subject: string)
	{
	return subject.replace(/[^a-zA-Z0-9]/g,'-');
	}

export function render_markdown(body: string)
	{
	return marked.parse(body
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;"));
	}

export async function address_to_name(address: string, height?: number)
	{
	const result = await fetchNamesByAddress({url: API_URL, blockchain: "stacks", address});
	return result && result.names && result.names[0];
	}

export async function address_to_name_cached(address: string, height?: number, ttl?: number)
	{
	if (!ttl)
		ttl = hours(168);
	height = 0;
	return remember(`bns:${height}:${address}`, ttl, () => address_to_name(address, height));
	}

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function timestamp_to_date(timestamp: number)
	{
	const date = new Date(timestamp);
	return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} at ${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}`;
	}

export function timestamp_to_relative_date(timestamp: number)
	{
	const now = Date.now();
	const relative_seconds = (now - timestamp)/1000;
	if (relative_seconds < 30)
		return "A few seconds ago";
	if (relative_seconds < 3540)
		return `${Math.round(relative_seconds/60)} minute${relative_seconds < 90?"":"s"} ago`;
	if (relative_seconds < 86400)
		return `${Math.round(relative_seconds/3600)} hour${relative_seconds < 5400?"":"s"} ago`;
	return timestamp_to_date(timestamp);
	}

export function object_to_json_data_uri(obj: any)
	{
	return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(obj))}`;
	}


