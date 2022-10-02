import { Database } from "sqlite3";
import { SQLITE_DATABASE_FILE } from "$env/static/private";
import type { Thread } from "$types/thread";
import type { Reply } from "$types/reply";

const db = new Database(SQLITE_DATABASE_FILE);
process.on("SIGINT",db.close);

function buffer_to_uint8array(buffer: Buffer)
	{
	const array = new Uint8Array(buffer.byteLength);
	for (let i = 0 ; i < buffer.byteLength ; ++i)
		array[i] = buffer[i];
	return array;
	}

function convert_message_row(row: any)
	{
	const author = row.author ? buffer_to_uint8array(row.author) : null;
	const signature = row.signature ? buffer_to_uint8array(row.signature) : null;
	return { ...row, author, signature };
	}

export async function get_thread(thread_id: number): Promise<Thread>
	{
	return new Promise((resolve,reject) =>
		db.get("SELECT * FROM `threads` WHERE `thread_id` = ?",
			thread_id,
			(err, row) => err ? reject(err) : resolve(convert_message_row(row))
			)
		);
	}

export async function get_latest_threads(limit: number = 10, author?: Uint8Array): Promise<Thread[]>
	{
	return new Promise((resolve,reject) =>
		db.all(
			author
				? "SELECT * FROM `threads` WHERE `author` = ? ORDER BY `last_reply` DESC LIMIT ?"
				: "SELECT * FROM `threads` ORDER BY `last_reply` DESC LIMIT ?",
			author? [author, limit] : limit,
			(err, rows) => err ? reject(err) : resolve(rows.map(convert_message_row))
			)
		);
	}

export async function post_thread(thread: Thread): Promise<number | any>
	{
	return new Promise((resolve,reject) =>
		db.run("INSERT INTO `threads` (`subject`, `body`, `author`, `timestamp`, `last_reply`, `signature`) VALUES (?,?,?,?,?,?)",
			[thread.subject, thread.body, thread.author, thread.timestamp, thread.timestamp, thread.signature],
			function(err: any) { err ? reject(err) : resolve((this as any).lastID)}
			)
		);
	}

export async function delete_thread(thread_id: number): Promise<true | any>
	{
	return new Promise((resolve,reject) =>
		db.run("UPDATE `threads` SET `body` = '', `signature` = '' where `thread_id` = ?",
			thread_id,
			function(err: any) { err ? reject(err) : resolve(true)}
			)
		);
	}

export async function get_reply(reply_id: number): Promise<Thread>
	{
	return new Promise((resolve,reject) =>
		db.get("SELECT * FROM `replies` WHERE `reply_id` = ?",
			reply_id,
			(err, row) => err ? reject(err) : resolve(convert_message_row(row))
			)
		);
	}

export async function get_replies(thread_id: number, page: number, limit: number = 100): Promise<Reply[]>
	{
	return new Promise((resolve,reject) =>
		db.all("SELECT * FROM `replies` WHERE `thread_id` = ? ORDER BY `timestamp` ASC LIMIT ? OFFSET ?",
			[thread_id, limit, page*limit],
			(err, rows) => err ? reject(err) : resolve(rows.map(convert_message_row))
			)
		);
	}

export async function post_reply(reply: Reply): Promise<number | any>
	{
	return new Promise((resolve,reject) =>
		db.serialize(() =>
			{
			let rejected = false;
			const reject_once = (err: any) =>
				{
				if (rejected)
					return;
				rejected = true;
				reject(err);
				};
			db.run("UPDATE `threads` SET `last_reply` = ? WHERE thread_id = ?",
				[reply.timestamp, reply.thread_id],
				function(err: any) {err && reject_once(err)}
				);
			db.run("INSERT INTO `replies` (`thread_id`, `body`, `author`, `timestamp`, `signature`) VALUES (?,?,?,?,?)",
				[reply.thread_id, reply.body, reply.author, reply.timestamp, reply.signature],
				function(err: any) {err ? reject_once(err) : resolve((this as any).lastID)}
				)
			})
		);
	}

export async function delete_reply(reply_id: number): Promise<true | any>
	{
	return new Promise((resolve,reject) =>
		db.run("UPDATE `replies` SET `body` = '', `signature` = '' WHERE `reply_id` = ?",
			reply_id,
			function(err: any) { err ? reject(err) : resolve(true)}
			)
		);
	}
