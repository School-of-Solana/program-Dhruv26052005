# Deployment Guide

This guide will help you deploy the Polling dApp to Solana Devnet and host the frontend.

## Prerequisites Checklist

- [ ] Solana CLI installed and configured
- [ ] Anchor CLI installed (v0.30.1)
- [ ] Node.js and npm/yarn installed
- [ ] Solana wallet with Devnet SOL
- [ ] Vercel account (for frontend deployment)

## Step 1: Set Up Solana Wallet

```bash
# Generate a new keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Set to Devnet
solana config set --url devnet

# Check your wallet address
solana address

# Airdrop SOL for deployment (repeat if needed)
solana airdrop 2
```

## Step 2: Build and Deploy Anchor Program

```bash
# Navigate to anchor project
cd anchor_project

# Install dependencies
yarn install

# Build the program
anchor build

# Get the program ID
anchor keys list

# IMPORTANT: Copy the program ID and update it in:
# - Anchor.toml (replace the existing ID)
# - programs/polling_dapp/src/lib.rs (in declare_id! macro)

# Build again after updating IDs
anchor build

# Run tests to ensure everything works
anchor test

# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Note: Save the deployed program ID from the output
```

## Step 3: Update Frontend Configuration

```bash
# Navigate to frontend
cd ../frontend

# Update the PROGRAM_ID in src/idl.ts with your deployed program ID
# Replace the existing PROGRAM_ID with the one from anchor deploy
```

Example:
```typescript
export const PROGRAM_ID = "YourActualDeployedProgramID";
```

## Step 4: Test Frontend Locally

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000 in your browser
# Connect your Solana wallet (set to Devnet)
# Test creating a poll and voting
```

## Step 5: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from frontend directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No
# - Project name? polling-dapp (or your preferred name)
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Web Interface

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Click "Deploy"

## Step 6: Update PROJECT_DESCRIPTION.md

After deployment, update the PROJECT_DESCRIPTION.md file:

```markdown
**Deployed Frontend URL:** https://your-app.vercel.app

**Solana Program ID:** `YourActualDeployedProgramID`
```

## Step 7: Test Deployed Application

1. Visit your deployed frontend URL
2. Connect wallet (ensure it's on Devnet)
3. Create a test poll
4. Vote on the poll with a different account
5. Verify results update correctly

## Troubleshooting

### "Insufficient funds" error
```bash
# Airdrop more SOL
solana airdrop 2
```

### Program deployment fails
```bash
# Check Solana config
solana config get

# Ensure you're on Devnet
solana config set --url devnet

# Check balance
solana balance
```

### Frontend can't connect to program
- Verify PROGRAM_ID in `frontend/src/idl.ts` matches deployed program
- Ensure wallet is set to Devnet
- Check browser console for errors

### Tests fail
```bash
# Clean and rebuild
anchor clean
anchor build
anchor test
```

## Verification Checklist

Before submitting, verify:

- [ ] Anchor program builds successfully
- [ ] All tests pass (both happy and unhappy paths)
- [ ] Program is deployed to Devnet
- [ ] Frontend is deployed and accessible
- [ ] Can create polls through frontend
- [ ] Can vote on polls through frontend
- [ ] Double voting is prevented
- [ ] PROJECT_DESCRIPTION.md is complete with URLs
- [ ] All code is pushed to GitHub main branch

## Useful Commands

```bash
# Check Solana version
solana --version

# Check Anchor version
anchor --version

# View program logs
solana logs <PROGRAM_ID>

# Get program info
solana program show <PROGRAM_ID>

# Check account info
solana account <ACCOUNT_ADDRESS>
```

## Support

If you encounter issues:
1. Check the error messages carefully
2. Verify all prerequisites are installed
3. Ensure you're on Devnet
4. Check Solana Discord or School of Solana Discord
5. Review Anchor documentation

## Next Steps After Deployment

1. Share your dApp URL with others
2. Test with multiple wallets
3. Monitor transaction logs
4. Consider adding more features
5. Deploy to Mainnet (after thorough testing)

---

Good luck with your deployment! 🚀
