import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { PROGRAM_ID, IDL } from '../idl';

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
    
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
    return provider;
  }, [connection, wallet]);

  const getProgram = useCallback(() => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(IDL as any, new PublicKey(PROGRAM_ID), provider);
  }, [getProvider]);

  const loadPolls = useCallback(async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const allPolls = await program.account.poll.all();
      setPolls(allPolls as any);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, getProgram]);

  useEffect(() => {
    if (wallet.publicKey && activeTab === 'vote') {
      loadPolls();
    }
  }, [wallet.publicKey, activeTab, loadPolls]);

  const createPoll = async () => {
    if (!wallet.publicKey) {
      setError('Please connect your wallet');
      return;
    }

    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const program = getProgram();
      if (!program) {
        setError('Failed to initialize program');
        return;
      }

      const pollIdNum = new BN(pollId);
      const filteredOptions = options.filter(opt => opt.trim() !== '');

      if (!question.trim()) {
        setError('Question is required');
        return;
      }

      if (filteredOptions.length < 2) {
        setError('At least 2 options are required');
        return;
      }

      const [pollPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('poll'),
          wallet.publicKey.toBuffer(),
          pollIdNum.toArrayLike(Buffer, 'le', 8),
        ],
        new PublicKey(PROGRAM_ID)
      );

      await program.methods
        .createPoll(pollIdNum, question, filteredOptions)
        .accounts({
          poll: pollPda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess('Poll created successfully!');
      setPollId('');
      setQuestion('');
      setOptions(['', '']);
      
      // Switch to vote tab and reload polls
      setTimeout(() => {
        setActiveTab('vote');
        loadPolls();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating poll:', err);
      setError(err.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const vote = async (pollAddress: PublicKey, optionIndex: number) => {
    if (!wallet.publicKey) {
      setError('Please connect your wallet');
      return;
    }

    setError('');
    setSuccess('');
    setVoting(true);

    try {
      const program = getProgram();
      if (!program) {
        setError('Failed to initialize program');
        return;
      }

      const [voterRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter'),
          pollAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        new PublicKey(PROGRAM_ID)
      );

      await program.methods
        .vote(optionIndex)
        .accounts({
          poll: pollAddress,
          voterRecord: voterRecordPda,
          voter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

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
            <input
              type="number"
              value={pollId}
              onChange={(e) => setPollId(e.target.value)}
              placeholder="Enter a unique poll ID (e.g., 1, 2, 3...)"
            />
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
