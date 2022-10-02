# Stacks Voice

Stacks Voice is a reference project that builds on the [SIP018 signed structured data standard](https://github.com/stacksgov/sips/pull/57) to create an accountless internet forum. Threads and posts are signed messages that are independently verified by clients accessing the forum. Although the reference implementation uses a central backend to index and store the messages, it is impossible for the host to alter their contents without alerting users.

The purpose of this project is to show how SIP018 messages can be used to create off-chain applications that leverage on-chain identities and trust.

The application is built with [SvelteKit](https://kit.svelte.dev) and [micro-stacks](https://micro-stacks.dev).

# Features

- **Accountless**: there is no need for users to register an account. Instead, they connect their wallet (like Hiro Wallet) and send properly signed SIP018 messages to the backend. The backend checks if the signature is valid and whether it was written recently. If so, it will add the message to its local database.

- **BNS support**: the application automatically resolves the BNS names of authors (if any), and displays them next to the posts.

- **Client-side verification**: clients independently verify the posts and display the verification status next to each post. Any invalid posts—for example due to server-side manipulation—are displayed differently and clearly marked.

- **Manual verification**: users can download raw messages and verify their authenticity manually.

- **Post deletion**: posts can be deleted by the original author. The request to delete a post is likewise done by means of a signed message.

# Limitations

- BNS names are resolved based on current time. Ideally the BNS name of authors should be resolved according to the closest block height at the time of the post. There is currently no built-in way to do this apart from running your own node. (Running a node was out of scope for the project.)

- No profile picture support. Once we have full Stacks profile capability the application can automatically show profile pictures for authors. Another solution would be to add a signed message that allows the user to define an NFT it owns as a profile picture. (Which is then stored in the backend.) We ran out of time and thus were unable to create an example of how it could be done.

- No spam control nor administrative support. A bot can blast the API with properly signed messages and the backend will accept them. An end-user version of Stacks Voice should include administrative capabilities and other content safeguards. Naturally we recognise the problem but it was low priority as this is a reference project.

- No edit capabilities. Users can only post or delete messages.

# On-chain capabilities

The signed messages for the project are used exclusively off-chain. However, there is nothing that would prevent the messages from being used on-chain. We had the idea to implement a poll voting feature in Stacks Voice with the intention to bring those votes on-chain later. Such a feature would be fantastic DAO governance: discuss and vote off-chain and take the result on-chain. Unfortunately, the Clarity Innovation Lab ran out of time and we were unable to complete the feature and corresponding [ExecutorDAO](https://github.com/MarvinJanssen/executor-dao) extension in time.

# Install and run a development server

1. Copy `.env.example` to `.env` and edit where necessary.
2. Run `npm install` to install dependencies.
3. Run `npm run db:create` to create the SQLite3 database.
4. Run `npm run dev` to start the development server.
5. Follow console instructions.

# Integrations

- Stacks Voice is currently being integrated into the [stx.eco](https://stx.eco) EcosytemDAO.

# License

MIT

