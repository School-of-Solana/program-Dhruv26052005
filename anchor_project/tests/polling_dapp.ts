import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PollingDapp } from "../target/types/polling_dapp";
import { expect } from "chai";

describe("polling_dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PollingDapp as Program<PollingDapp>;
  
  const creator = provider.wallet;
  const voter1 = anchor.web3.Keypair.generate();
  const voter2 = anchor.web3.Keypair.generate();
  
  const pollId = new anchor.BN(1);
  const question = "What is your favorite programming language?";
  const options = ["Rust", "TypeScript", "Python", "JavaScript"];

  let pollPda: anchor.web3.PublicKey;
  let pollBump: number;

  before(async () => {
    // Airdrop SOL to test voters
    const airdropSig1 = await provider.connection.requestAirdrop(
      voter1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig1);

    const airdropSig2 = await provider.connection.requestAirdrop(
      voter2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig2);

    // Derive poll PDA
    [pollPda, pollBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("poll"),
        creator.publicKey.toBuffer(),
        pollId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  });

  describe("Happy Path Tests", () => {
    it("Successfully creates a poll", async () => {
      const tx = await program.methods
        .createPoll(pollId, question, options)
        .accounts({
          poll: pollPda,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Create poll transaction signature:", tx);

      // Fetch the poll account
      const pollAccount = await program.account.poll.fetch(pollPda);

      // Verify poll data
      expect(pollAccount.pollId.toString()).to.equal(pollId.toString());
      expect(pollAccount.creator.toString()).to.equal(creator.publicKey.toString());
      expect(pollAccount.question).to.equal(question);
      expect(pollAccount.options).to.deep.equal(options);
      expect(pollAccount.votes.map(v => v.toNumber())).to.deep.equal([0, 0, 0, 0]);
      expect(pollAccount.totalVotes.toNumber()).to.equal(0);
      expect(pollAccount.bump).to.equal(pollBump);
    });

    it("Successfully allows a user to vote", async () => {
      const optionIndex = 0; // Vote for "Rust"

      const [voterRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("voter"),
          pollPda.toBuffer(),
          voter1.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .vote(optionIndex)
        .accounts({
          poll: pollPda,
          voterRecord: voterRecordPda,
          voter: voter1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();

      console.log("Vote transaction signature:", tx);

      // Fetch updated poll account
      const pollAccount = await program.account.poll.fetch(pollPda);
      expect(pollAccount.votes[optionIndex].toNumber()).to.equal(1);
      expect(pollAccount.totalVotes.toNumber()).to.equal(1);

      // Fetch voter record
      const voterRecord = await program.account.voterRecord.fetch(voterRecordPda);
      expect(voterRecord.voter.toString()).to.equal(voter1.publicKey.toString());
      expect(voterRecord.pollId.toString()).to.equal(pollId.toString());
      expect(voterRecord.chosenOption).to.equal(optionIndex);
    });

    it("Successfully allows multiple users to vote", async () => {
      const optionIndex = 2; // Vote for "Python"

      const [voterRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("voter"),
          pollPda.toBuffer(),
          voter2.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .vote(optionIndex)
        .accounts({
          poll: pollPda,
          voterRecord: voterRecordPda,
          voter: voter2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter2])
        .rpc();

      console.log("Second vote transaction signature:", tx);

      // Fetch updated poll account
      const pollAccount = await program.account.poll.fetch(pollPda);
      expect(pollAccount.votes[0].toNumber()).to.equal(1); // Rust still has 1 vote
      expect(pollAccount.votes[2].toNumber()).to.equal(1); // Python now has 1 vote
      expect(pollAccount.totalVotes.toNumber()).to.equal(2);
    });
  });

  describe("Unhappy Path Tests", () => {
    it("Fails to create poll with empty question", async () => {
      const badPollId = new anchor.BN(2);
      const [badPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          badPollId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createPoll(badPollId, "", options)
          .accounts({
            poll: badPollPda,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.error.errorMessage).to.include("Question must be between 1 and 200 characters");
      }
    });

    it("Fails to create poll with too few options", async () => {
      const badPollId = new anchor.BN(3);
      const [badPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          badPollId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createPoll(badPollId, "Only one option?", ["Yes"])
          .accounts({
            poll: badPollPda,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.error.errorMessage).to.include("Must have between 2 and 10 options");
      }
    });

    it("Fails to create poll with too many options", async () => {
      const badPollId = new anchor.BN(4);
      const [badPollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("poll"),
          creator.publicKey.toBuffer(),
          badPollId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tooManyOptions = Array.from({ length: 11 }, (_, i) => `Option ${i + 1}`);

      try {
        await program.methods
          .createPoll(badPollId, "Too many options", tooManyOptions)
          .accounts({
            poll: badPollPda,
            creator: creator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.error.errorMessage).to.include("Must have between 2 and 10 options");
      }
    });

    it("Fails when user tries to vote twice", async () => {
      const [voterRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("voter"),
          pollPda.toBuffer(),
          voter1.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .vote(1) // Try to vote again with different option
          .accounts({
            poll: pollPda,
            voterRecord: voterRecordPda,
            voter: voter1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([voter1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Account already exists error from Anchor
        expect(error.message).to.include("already in use");
      }
    });

    it("Fails when voting with invalid option index", async () => {
      const voter3 = anchor.web3.Keypair.generate();
      
      // Airdrop SOL
      const airdropSig = await provider.connection.requestAirdrop(
        voter3.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const [voterRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("voter"),
          pollPda.toBuffer(),
          voter3.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .vote(10) // Invalid option index (only 0-3 are valid)
          .accounts({
            poll: pollPda,
            voterRecord: voterRecordPda,
            voter: voter3.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([voter3])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.error.errorMessage).to.include("Invalid option index");
      }
    });
  });
});
