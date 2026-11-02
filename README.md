# SolWatch

Read-only Solana wallet tracker. Paste a public address, or connect Phantom or Solflare, and see the SOL balance, SPL tokens, USD value, and recent transactions.

SolWatch never asks for a seed phrase or private key, and it has no send or sign flow.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- [`@solana/kit`](https://www.solanakit.com) for RPC (`createSolanaRpc`, `address`)
- Phantom and Solflare through `@solana/wallet-adapter-*` (connect only)
- Jupiter Price API and Token API for names, logos, and USD prices, cached for 60 seconds

`@solana/web3.js` is installed because the wallet adapter requires it. Account reads do not use it.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default cluster is devnet. Public devnet RPC is rate-limited, so set `SOLANA_RPC_URL` to a [Helius](https://www.helius.dev/) or [QuickNode](https://www.quicknode.com/) URL before sharing the app.

| Variable | Where it is read | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLUSTER` | Browser and server | `devnet` (default), `testnet`, or `mainnet-beta` |
| `SOLANA_RPC_URL` | Server only | RPC endpoint. Do not prefix with `NEXT_PUBLIC`. |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Browser | Endpoint for the connect button. A public cluster URL is enough. |
| `JUPITER_API_KEY` | Server only | Optional. Raises the Jupiter price-request limit. |
| `NEXT_PUBLIC_SITE_URL` | Server | Canonical origin for Open Graph metadata. |

Mainnet example:

```bash
NEXT_PUBLIC_CLUSTER=mainnet-beta
SOLANA_RPC_URL=https://your-mainnet-rpc.example
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Keep the cluster and `SOLANA_RPC_URL` on the same network. SolWatch warns when they disagree.

## What the wallet page shows

- SOL balance, converted with `Number(lamports) / 1e9`
- The last 20 signatures, with time, success or failure, and a Solscan link
- SPL Token and Token-2022 accounts (`getTokenAccountsByOwner`, `jsonParsed`)
- Token name, logo, and USD price. Unlisted tokens stay behind “Show unlisted”
- A SOL chart from recent transaction balances, plus later checks saved in this browser
- A watchlist in `localStorage`

Empty token accounts are hidden. Prices for devnet mints are usually missing because Jupiter indexes mainnet; SOL still has a price.

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
```

Tests cover address validation and lamports conversion.

## Deploy

Deploy on Vercel. Add the same environment variables in the project settings, set `NEXT_PUBLIC_SITE_URL` to the live origin, and put `.env.local` in `.gitignore` before the first commit (it already is).

Live demo: add the Vercel URL here after deploy.

## Safety

- Use devnet wallets while building. Never paste a real key into code, prompts, or chat.
- Ignore any request to "send SOL to unlock funds." That is a scam.
- Connecting a wallet only reveals its public address and opens that dashboard.
"# sol-watch" 
