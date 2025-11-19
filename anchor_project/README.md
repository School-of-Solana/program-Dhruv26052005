# Polling dApp - Anchor Program

A decentralized polling system built on Solana using Anchor framework.

## Features

- Create polls with custom questions and multiple-choice options
- Secure voting with double-vote prevention using PDAs
- On-chain vote storage and transparent results

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js and Yarn](https://nodejs.org/)

## Installation

```bash
# Install dependencies
yarn install
```

## Building

```bash
# Build the program
anchor build
```

## Testing

```bash
# Run tests
anchor test

# Run tests with logs
anchor test -- --nocapture
```

## Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet (use with caution)
anchor deploy --provider.cluster mainnet
```

## Program Structure

- `programs/polling_dapp/src/lib.rs` - Main program code
  - `create_poll` - Instruction to create a new poll
  - `vote` - Instruction to vote on a poll
  - `Poll` - Account structure for polls
  - `VoterRecord` - Account structure for voter records

## PDAs Used

1. **Poll PDA**: `["poll", creator_pubkey, poll_id]`
2. **Voter Record PDA**: `["voter", poll_pubkey, voter_pubkey]`

## Program ID

```
9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT
```

✅ Deployed on Solana Devnet via Solana Playground