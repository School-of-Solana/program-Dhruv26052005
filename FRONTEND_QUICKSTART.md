# Quick Start - Running the Frontend

## ✅ Program Already Deployed!

Your program is deployed on Solana Devnet:
- **Program ID**: `9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT`
- All files have been updated with the correct Program ID

## 🚀 Steps to Run Frontend

### 1. Open Command Prompt and navigate to frontend folder:
```cmd
cd "c:\final task 5\program-Dhruv26052005\frontend"
```

### 2. Install dependencies:
```cmd
npm install
```

This will install:
- React and React DOM
- Solana Web3.js
- Solana Wallet Adapter
- Anchor libraries
- All other dependencies

**Note**: This may take 2-5 minutes

### 3. Start the development server:
```cmd
npm start
```

This will:
- Compile the React app
- Start the dev server on http://localhost:3000
- Automatically open your browser

## 📱 Using the App

### First Time Setup:

1. **Install a Solana Wallet** (if you don't have one):
   - Download [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)
   - Create a new wallet
   - **Switch network to Devnet** in wallet settings

2. **Get Devnet SOL**:
   - Go to https://faucet.solana.com/
   - Paste your wallet address
   - Request airdrop (2 SOL)

### Using the Polling dApp:

**Create a Poll:**
1. Click "Select Wallet" and connect your wallet
2. Go to "Create Poll" tab
3. Enter a Poll ID (e.g., 1, 2, 3...)
4. Write your question
5. Add 2-10 options
6. Click "Create Poll"
7. Approve the transaction in your wallet

**Vote on a Poll:**
1. Go to "Vote on Polls" tab
2. Click "Refresh" to load polls
3. Click on a poll to expand it
4. Select your choice
5. Click "Submit Vote"
6. Approve the transaction

## ⚠️ Troubleshooting

### "Cannot find module" errors during npm install
- Make sure you're in the `frontend` folder
- Delete `node_modules` and `package-lock.json` if they exist
- Run `npm install` again

### App loads but can't see polls
- Make sure your wallet is connected
- Ensure wallet is on **Devnet** (not Mainnet)
- Click the "Refresh" button
- Check browser console (F12) for errors

### Transaction fails
- Ensure you have Devnet SOL in your wallet
- Verify wallet is on Devnet network
- Check if program ID is correct: `9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT`

### "Already voted" error
- This is expected! You can only vote once per poll
- Try creating a new poll or use a different wallet

## 🎉 What's Working Now

✅ Program deployed on Devnet  
✅ Frontend configured with correct Program ID  
✅ IDL matches deployed program  
✅ Wallet integration ready  
✅ Create poll functionality  
✅ Voting functionality  
✅ Real-time results display  
✅ Double-vote prevention  

## 📝 Next Steps After Testing

1. Test creating multiple polls
2. Test voting with different wallets
3. Verify double-vote prevention works
4. Deploy frontend to Vercel (see DEPLOYMENT_GUIDE.md)
5. Update PROJECT_DESCRIPTION.md with deployed frontend URL

---

**Ready to go! Just run the commands above in Command Prompt.** 🚀
