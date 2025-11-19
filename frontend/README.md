# Polling dApp - React Frontend

Modern React frontend for the Solana polling dApp with wallet integration.

## Features

- 🔐 Wallet integration (Phantom, Solflare)
- 📊 Create custom polls
- 🗳️ Vote on polls (one vote per user)
- 📈 Real-time vote tracking with percentages
- 🎨 Beautiful, responsive UI

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- A Solana wallet (Phantom or Solflare recommended)

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Building

```bash
# Build for production
npm run build
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the app: `npm run build`
2. Drag and drop the `build` folder to [Netlify Drop](https://app.netlify.com/drop)

## Configuration

Update the Program ID in `src/idl.ts` after deploying the Anchor program:

```typescript
export const PROGRAM_ID = "YOUR_DEPLOYED_PROGRAM_ID";
```

## Usage

1. **Connect Wallet**: Click "Select Wallet" and choose your wallet
2. **Create Poll**: Go to "Create Poll" tab, fill in details, submit
3. **Vote**: Go to "Vote on Polls" tab, select a poll, choose an option, submit
4. **View Results**: See real-time vote counts and percentages

## Tech Stack

- React 18
- TypeScript
- Solana Web3.js
- Anchor
- Solana Wallet Adapter