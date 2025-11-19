use anchor_lang::prelude::*;

declare_id!("9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT");

#[program]
pub mod polling_dapp {
    use super::*;

    /// Creates a new poll with a question and options
    pub fn create_poll(
        ctx: Context<CreatePoll>,
        poll_id: u64,
        question: String,
        options: Vec<String>,
    ) -> Result<()> {
        require!(question.len() > 0 && question.len() <= 200, PollError::InvalidQuestion);
        require!(options.len() >= 2 && options.len() <= 10, PollError::InvalidOptions);
        
        // Verify all options are valid
        for option in &options {
            require!(option.len() > 0 && option.len() <= 50, PollError::InvalidOptionText);
        }

        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.creator = ctx.accounts.creator.key();
        poll.question = question;
        poll.options = options.clone();
        poll.votes = vec![0; options.len()];
        poll.total_votes = 0;
        poll.created_at = Clock::get()?.unix_timestamp;
        poll.bump = ctx.bumps.poll;

        msg!("Poll created with ID: {}", poll_id);
        msg!("Question: {}", poll.question);
        msg!("Options: {:?}", poll.options);

        Ok(())
    }

    /// Allows a user to vote on a poll (only once)
    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        
        require!(
            (option_index as usize) < poll.options.len(),
            PollError::InvalidOptionIndex
        );

        // Increment vote count for the chosen option
        poll.votes[option_index as usize] += 1;
        poll.total_votes += 1;

        // Record voter's choice
        let voter_record = &mut ctx.accounts.voter_record;
        voter_record.voter = ctx.accounts.voter.key();
        voter_record.poll_id = poll.poll_id;
        voter_record.chosen_option = option_index;
        voter_record.voted_at = Clock::get()?.unix_timestamp;
        voter_record.bump = ctx.bumps.voter_record;

        msg!("Vote recorded for option: {}", option_index);
        msg!("Total votes: {}", poll.total_votes);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64, question: String, options: Vec<String>)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = creator,
        space = Poll::space(&question, &options),
        seeds = [b"poll", creator.key().as_ref(), &poll_id.to_le_bytes()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [b"poll", poll.creator.as_ref(), &poll.poll_id.to_le_bytes()],
        bump = poll.bump
    )]
    pub poll: Account<'info, Poll>,
    
    #[account(
        init,
        payer = voter,
        space = VoterRecord::SPACE,
        seeds = [b"voter", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Poll {
    pub poll_id: u64,           // 8 bytes
    pub creator: Pubkey,        // 32 bytes
    pub question: String,       // 4 + len bytes
    pub options: Vec<String>,   // 4 + (4 + len) * count bytes
    pub votes: Vec<u64>,        // 4 + 8 * count bytes
    pub total_votes: u64,       // 8 bytes
    pub created_at: i64,        // 8 bytes
    pub bump: u8,               // 1 byte
}

impl Poll {
    pub fn space(question: &str, options: &[String]) -> usize {
        8 + // discriminator
        8 + // poll_id
        32 + // creator
        4 + question.len() + // question
        4 + options.iter().map(|opt| 4 + opt.len()).sum::<usize>() + // options
        4 + (8 * options.len()) + // votes
        8 + // total_votes
        8 + // created_at
        1 + // bump
        100 // extra buffer for safety
    }
}

#[account]
pub struct VoterRecord {
    pub voter: Pubkey,          // 32 bytes
    pub poll_id: u64,           // 8 bytes
    pub chosen_option: u8,      // 1 byte
    pub voted_at: i64,          // 8 bytes
    pub bump: u8,               // 1 byte
}

impl VoterRecord {
    pub const SPACE: usize = 8 + 32 + 8 + 1 + 8 + 1;
}

#[error_code]
pub enum PollError {
    #[msg("Question must be between 1 and 200 characters")]
    InvalidQuestion,
    
    #[msg("Must have between 2 and 10 options")]
    InvalidOptions,
    
    #[msg("Option text must be between 1 and 50 characters")]
    InvalidOptionText,
    
    #[msg("Invalid option index")]
    InvalidOptionIndex,
}
