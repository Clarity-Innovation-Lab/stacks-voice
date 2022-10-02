#!/usr/bin/env node
import {config} from "dotenv";
import sqlite3 from "sqlite3";
const {Database} = sqlite3;
import {dirname} from "path";
import {unlinkSync, mkdirSync} from "fs";
config();

const database_file = process.env.SQLITE_DATABASE_FILE || "./data/data.db";

try
	{
	mkdirSync(dirname(database_file),{recursive: true});
	}
catch(e){}

try
	{
	unlinkSync(database_file);
	console.log(`Deleted existing file ${database_file}`);
	}
catch(e){}

const queries = [
`CREATE TABLE "threads" (
	"thread_id"	INTEGER,
	"subject"	TEXT NOT NULL,
	"body"	TEXT NOT NULL,
	"author"	BLOB NOT NULL,
	"timestamp"	INTEGER NOT NULL,
	"last_reply"	INTEGER NOT NULL,
	"signature"	BLOB NOT NULL,
	PRIMARY KEY("thread_id" AUTOINCREMENT)
);`,
`CREATE TABLE "replies" (
	"reply_id"	INTEGER,
	"thread_id"	INTEGER NOT NULL,
	"body"	TEXT NOT NULL,
	"timestamp"	NUMERIC NOT NULL,
	"author"	BLOB NOT NULL,
	"signature"	BLOB NOT NULL,
	PRIMARY KEY("reply_id" AUTOINCREMENT),
	FOREIGN KEY("thread_id") REFERENCES "threads"("thread_id") ON UPDATE CASCADE ON DELETE CASCADE
);`,
`CREATE INDEX "thread_author" ON "threads" ("author");`,
`CREATE INDEX "reply_author" ON "replies" ("author");`
];

const db = new Database(database_file, error => error && console.error(error));
process.on("SIGINT",db.close);
db.serialize(() => queries.map(query => db.run(query)));
db.close();
console.log(`Created fresh database ${database_file}`);
