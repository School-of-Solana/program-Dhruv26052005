import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { sha256 } from 'js-sha256';

// Define program ID outside component to ensure it persists
const PROGRAM_ID_STRING = "9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT";
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// Calculate Anchor instruction discriminators
function getDiscriminator(instructionName: string): Buffer {
  const hash = sha256.digest(`global:${instructionName}`);
  return Buffer.from(hash.slice(0, 8));
}

// Helper to serialize data
function serializeCreatePollData(pollId: BN, question: string, options: string[]): Buffer {
  const discriminator = getDiscriminator('create_poll');
  
  // Serialize arguments
  const pollIdBuf = pollId.toArrayLike(Buffer, 'le', 8);
  
  const questionBuf = Buffer.from(question, 'utf8');
  const questionLen = Buffer.alloc(4);
  questionLen.writeUInt32LE(questionBuf.length, 0);
  
  const optionsLen = Buffer.alloc(4);
  optionsLen.writeUInt32LE(options.length, 0);
  
  const optionBuffers = options.map(opt => {
    const optBuf = Buffer.from(opt, 'utf8');
    const optLen = Buffer.alloc(4);
    optLen.writeUInt32LE(optBuf.length, 0);
    return Buffer.concat([optLen, optBuf]);
  });
  
  return Buffer.concat([
    discriminator,
    pollIdBuf,
    questionLen,
    questionBuf,
    optionsLen,
    ...optionBuffers
  ]);
}

function serializeVoteData(optionIndex: number): Buffer {
  const discriminator = getDiscriminator('vote');
  const optionBuf = Buffer.alloc(1);
  optionBuf.writeUInt8(optionIndex, 0);
  return Buffer.concat([discriminator, optionBuf]);
}

// Helper to deserialize poll account data
function deserializePollAccount(data: Buffer): Poll | null {
  try {
    // Skip 8-byte discriminator
    let offset = 8;
    
    // Read poll_id (u64)
    const pollId = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read creator (PublicKey - 32 bytes)
    const creator = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read question (string with 4-byte length prefix)
    const questionLen = data.readUInt32LE(offset);
    offset += 4;
    const question = data.slice(offset, offset + questionLen).toString('utf8');
    offset += questionLen;
    
    // Read options (vec of strings)
    const optionsCount = data.readUInt32LE(offset);
    offset += 4;
    const options: string[] = [];
    for (let i = 0; i < optionsCount; i++) {
      const optLen = data.readUInt32LE(offset);
      offset += 4;
      const opt = data.slice(offset, offset + optLen).toString('utf8');
      options.push(opt);
      offset += optLen;
    }
    
    // Read votes (vec of u64)
    const votesCount = data.readUInt32LE(offset);
    offset += 4;
    const votes: BN[] = [];
    for (let i = 0; i < votesCount; i++) {
      const vote = new BN(data.slice(offset, offset + 8), 'le');
      votes.push(vote);
      offset += 8;
    }
    
    // Read total_votes (u64)
    const totalVotes = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read created_at (i64)
    const createdAt = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read bump (u8)
    const bump = data.readUInt8(offset);
    
    return {
      pollId,
      creator,
      question,
      options,
      votes,
      totalVotes,
      createdAt,
      bump
    };
  } catch (err) {
    console.error('Error deserializing poll:', err);
    return null;
  }
}

interface Poll {
  pollId: BN;
  creator: PublicKey;
  question: string;
  options: string[];
  votes: BN[];
  totalVotes: BN;
  createdAt: BN;
  bump: number;
}

const PollingApp: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'vote'>('vote');
  
  // Create poll state
  const [pollId, setPollId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [creating, setCreating] = useState(false);
  
  // Generate a random poll ID
  const generatePollId = useCallback(() => {
    const randomId = Math.floor(Math.random() * 1000000);
    setPollId(randomId.toString());
  }, []);
  
  // Vote state
  const [polls, setPolls] = useState<{ address: PublicKey; data: Poll }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getProvider = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return wallet;
  }, [wallet]);

  const getProgram = useCallback(() => {
    // Not using Anchor Program anymore
    return null;
  }, []);

  const loadPolls = useCallback(async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching polls from program:', PROGRAM_ID.toBase58());
      
      // Fetch all accounts owned by the program
      const accounts = await connection.getProgramAccounts(PROGRAM_ID);
      
      console.log(`Found ${accounts.length} total accounts`);

      const pollData: { address: PublicKey; data: Poll }[] = [];
      
      for (const { pubkey, account } of accounts) {
        console.log(`Account ${pubkey.toBase58()}: size=${account.data.length} bytes`);
        
        // Try to deserialize as a poll (polls have 8-byte discriminator at start)
        const poll = deserializePollAccount(account.data);
        if (poll) {
          console.log(`Successfully decoded poll: ${poll.question}`);
          pollData.push({ address: pubkey, data: poll });
        } else {
          console.log(`Skipping account ${pubkey.toBase58()} - not a poll or failed to decode`);
        }
      }
      
      setPolls(pollData);
      console.log(`Loaded ${pollData.length} polls`);
      
      if (pollData.length === 0 && accounts.length > 0) {
        console.warn('Found accounts but none could be decoded as polls. Check deserialization logic.');
      }
    } catch (err) {
      console.error('Error loading polls:', err);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    if (wallet.publicKey && activeTab === 'vote') {
      loadPolls();
    }
  }, [wallet.publicKey, activeTab, loadPolls]);

  const createPoll = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const pollIdNum = new BN(pollId);
      const filteredOptions = options.filter(opt => opt.trim() !== '');

      if (!question.trim()) {
        setError('Question is required');
        setCreating(false);
        return;
      }

      if (filteredOptions.length < 2) {
        setError('At least 2 options are required');
        setCreating(false);
        return;
      }

      // Derive PDA for poll
      const [pollPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('poll'),
          wallet.publicKey.toBuffer(),
          pollIdNum.toArrayLike(Buffer, 'le', 8),
        ],
        PROGRAM_ID
      );

      // Serialize instruction data
      const data = serializeCreatePollData(pollIdNum, question, filteredOptions);

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: pollPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(data)
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess('Poll created successfully!');
      setPollId('');
      setQuestion('');
      setOptions(['', '']);
      
      setTimeout(() => {
        setActiveTab('vote');
        loadPolls();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating poll:', err);
      
      if (err.message && err.message.includes('already in use')) {
        setError(`Poll ID ${pollId} is already used. Please use a different poll ID.`);
      } else {
        setError(err.message || 'Failed to create poll');
      }
    } finally {
      setCreating(false);
    }
  };

  const vote = async (pollAddress: PublicKey, optionIndex: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    setError('');
    setSuccess('');
    setVoting(true);

    try {
      const [voterRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter'),
          pollAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      // Serialize instruction data
      const data = serializeVoteData(optionIndex);

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: pollAddress, isSigner: false, isWritable: true },
          { pubkey: voterRecordPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(data)
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess('Vote recorded successfully!');
      setSelectedOption(null);
      
      // Reload polls to show updated vote counts
      setTimeout(() => {
        loadPolls();
      }, 1000);
    } catch (err: any) {
      console.error('Error voting:', err);
      if (err.message.includes('already in use')) {
        setError('You have already voted on this poll');
      } else {
        setError(err.message || 'Failed to vote');
      }
    } finally {
      setVoting(false);
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  if (!wallet.connected) {
    return (
      <div className="empty-state">
        <h3>Welcome to Solana Polling dApp</h3>
        <p>Please connect your wallet to get started</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'vote' ? 'active' : ''}`}
          onClick={() => setActiveTab('vote')}
        >
          Vote on Polls
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Poll
        </button>
      </div>

      {activeTab === 'create' && (
        <div>
          <h2>Create New Poll</h2>
          
          <div className="form-group">
            <label>Poll ID (unique number)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                value={pollId}
                onChange={(e) => setPollId(e.target.value)}
                placeholder="Enter a unique poll ID (e.g., 1, 2, 3...)"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={generatePollId}
                type="button"
              >
                Generate Random
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={200}
            />
            <small>{question.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label>Options</label>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={50}
                  />
                  {options.length > 2 && (
                    <button
                      className="btn btn-danger"
                      onClick={() => removeOption(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                className="btn btn-secondary"
                onClick={addOption}
                type="button"
                style={{ marginTop: '10px' }}
              >
                + Add Option
              </button>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={createPoll}
            disabled={creating || !pollId || !question.trim()}
          >
            {creating ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      )}

      {activeTab === 'vote' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Available Polls</h2>
            <button className="btn btn-secondary" onClick={loadPolls} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && <div className="loading">Loading polls</div>}

          {!loading && polls.length === 0 && (
            <div className="empty-state">
              <h3>No polls found</h3>
              <p>Be the first to create a poll!</p>
            </div>
          )}

          <div className="polls-grid">
            {polls.map(({ address, data }) => {
              const totalVotes = data.totalVotes.toNumber();
              const isExpanded = selectedPoll === address.toString();

              return (
                <div
                  key={address.toString()}
                  className="poll-card"
                  onClick={() => setSelectedPoll(isExpanded ? null : address.toString())}
                >
                  <h3 className="poll-question">{data.question}</h3>
                  <div className="poll-info">
                    <div>Poll ID: {data.pollId.toString()}</div>
                    <div>Total Votes: {totalVotes}</div>
                    <div>Options: {data.options.length}</div>
                  </div>

                  {isExpanded && (
                    <div className="poll-options" onClick={(e) => e.stopPropagation()}>
                      {data.options.map((option, index) => {
                        const votes = data.votes[index].toNumber();
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                        return (
                          <div key={index}>
                            <div
                              className={`poll-option ${selectedOption === index ? 'selected' : ''}`}
                              onClick={() => setSelectedOption(index)}
                            >
                              <span className="option-text">{option}</span>
                              <span className="option-votes">{votes} votes</span>
                            </div>
                            <div className="vote-bar">
                              <div
                                className="vote-bar-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className="btn btn-primary"
                        onClick={() => selectedOption !== null && vote(address, selectedOption)}
                        disabled={voting || selectedOption === null}
                        style={{ marginTop: '15px', width: '100%' }}
                      >
                        {voting ? 'Submitting Vote...' : 'Submit Vote'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollingApp;
