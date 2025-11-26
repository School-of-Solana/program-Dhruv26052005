[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/TzDKD5h9)
![School of Solana](https://github.com/Ackee-Blockchain/school-of-solana/blob/master/.banner/banner.png?raw=true)

# 🗳️ Solana Polling dApp

**Live Demo:** [https://voting-neon-delta.vercel.app/](https://voting-neon-delta.vercel.app/)

**Program ID:** `9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT`

A decentralized polling system built on Solana blockchain using Anchor framework. Create polls, vote transparently, and prevent double voting through secure Program Derived Addresses (PDAs).

## 🎯 Project Overview

This dApp allows users to:
- Create custom polls with multiple-choice options
- Vote on polls (one vote per user, enforced on-chain)
- View real-time voting results with percentages
- Ensure transparency and immutability of all votes

## ✅ Task 5 Requirements Met

- ✅ Anchor program deployed on Devnet
- ✅ PDAs used for Poll and VoterRecord accounts
- ✅ Comprehensive TypeScript tests (happy + unhappy paths)
- ✅ React frontend with wallet integration
- ✅ Complete PROJECT_DESCRIPTION.md

## 📁 Project Structure

```
├── anchor_project/           # Solana program (Anchor)
│   ├── programs/
│   │   └── polling_dapp/
│   │       └── src/
│   │           └── lib.rs    # Main program code
│   ├── tests/                # TypeScript tests
│   └── package.json
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── components/      # React components
│   │   └── idl.ts           # Program IDL
│   └── package.json
│
└── PROJECT_DESCRIPTION.md    # Detailed project documentation
```

## 🚀 Quick Start

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.30.1)
- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://yarnpkg.com/)

### Anchor Program Setup

```bash
cd anchor_project

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🧪 Testing

The project includes comprehensive tests covering:

**Happy Paths:**
- Creating polls successfully
- Voting on polls
- Multiple users voting

**Unhappy Paths:**
- Invalid poll parameters (empty question, too few/many options)
- Double voting attempts
- Invalid option indices

Run tests:
```bash
cd anchor_project
anchor test
```

## 🏗️ Architecture

### Program Instructions

1. **create_poll** - Creates a new poll with question and options
   - Uses Poll PDA: `["poll", creator, poll_id]`
   - Validates input constraints
   
2. **vote** - Records a vote for a poll option
   - Creates VoterRecord PDA: `["voter", poll, voter]`
   - Prevents double voting

### Account Structures

**Poll Account:**
- poll_id, creator, question, options
- votes (array of counts), total_votes
- created_at timestamp, bump

**VoterRecord Account:**
- voter, poll_id, chosen_option
- voted_at timestamp, bump

## 🎨 Frontend Features

- Modern, responsive UI with gradient design
- Wallet integration (Phantom, Solflare)
- Tab-based navigation (Create Poll / Vote)
- Real-time vote percentages
- Error handling and user feedback

## 📝 Deployment Steps

1. **Deploy Program:**
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

2. **Update Frontend:**
   - Copy deployed program ID
   - Update `PROGRAM_ID` in `frontend/src/idl.ts`

3. **Deploy Frontend:**
   ```bash
   cd frontend
   npm run build
   vercel deploy
   ```

4. **Update PROJECT_DESCRIPTION.md:**
   - Add deployed frontend URL
   - Verify program ID is correct

## 🔐 Security Features

- **Double Vote Prevention**: VoterRecord PDA ensures one vote per user per poll
- **Input Validation**: Question (1-200 chars), Options (2-10, each 1-50 chars)
- **Ownership**: Polls are owned by creators via PDA seeds
- **Transparency**: All data stored on-chain and publicly viewable

## 📚 Documentation

See [PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md) for detailed information about:
- How to use the dApp
- Program architecture
- PDA implementation
- Test coverage
- Deployment instructions

## 🛠️ Technology Stack

**Blockchain:**
- Solana
- Anchor Framework v0.30.1
- Rust

**Frontend:**
- React 18
- TypeScript
- Solana Wallet Adapter
- Solana Web3.js

**Testing:**
- Mocha/Chai
- Anchor Test Framework

## 📄 License

This project is part of the School of Solana curriculum.

## 👤 Author

Dhruv26052005

---

**School of Solana - Task 5 Submission**
