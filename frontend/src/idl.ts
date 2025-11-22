import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey("9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT");

export type PollingDapp = {
  version: "0.1.0";
  name: "polling_dapp";
  instructions: [
    {
      name: "createPoll";
      accounts: [
        { name: "poll"; isMut: true; isSigner: false },
        { name: "creator"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "pollId"; type: "u64" },
        { name: "question"; type: "string" },
        { name: "options"; type: { vec: "string" } }
      ];
    },
    {
      name: "vote";
      accounts: [
        { name: "poll"; isMut: true; isSigner: false },
        { name: "voterRecord"; isMut: true; isSigner: false },
        { name: "voter"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "optionIndex"; type: "u8" }];
    }
  ];
  accounts: [
    {
      name: "poll";
      type: {
        kind: "struct";
        fields: [
          { name: "pollId"; type: "u64" },
          { name: "creator"; type: "publicKey" },
          { name: "question"; type: "string" },
          { name: "options"; type: { vec: "string" } },
          { name: "votes"; type: { vec: "u64" } },
          { name: "totalVotes"; type: "u64" },
          { name: "createdAt"; type: "i64" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "voterRecord";
      type: {
        kind: "struct";
        fields: [
          { name: "voter"; type: "publicKey" },
          { name: "pollId"; type: "u64" },
          { name: "chosenOption"; type: "u8" },
          { name: "votedAt"; type: "i64" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
  errors: [
    { code: 6000; name: "InvalidQuestion"; msg: "Question must be between 1 and 200 characters" },
    { code: 6001; name: "InvalidOptions"; msg: "Must have between 2 and 10 options" },
    { code: 6002; name: "InvalidOptionText"; msg: "Option text must be between 1 and 50 characters" },
    { code: 6003; name: "InvalidOptionIndex"; msg: "Invalid option index" }
  ];
};

export const IDL: PollingDapp = {
  version: "0.1.0",
  name: "polling_dapp",
  // @ts-ignore
  address: "9m9JeSMQojXMdGLwccYVxe5vYsFci4EN8zFtq7KXvStT",
  instructions: [
    {
      name: "createPoll",
      accounts: [
        { name: "poll", isMut: true, isSigner: false },
        { name: "creator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "pollId", type: "u64" },
        { name: "question", type: "string" },
        { name: "options", type: { vec: "string" } }
      ]
    },
    {
      name: "vote",
      accounts: [
        { name: "poll", isMut: true, isSigner: false },
        { name: "voterRecord", isMut: true, isSigner: false },
        { name: "voter", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "optionIndex", type: "u8" }]
    }
  ],
  accounts: [
    {
      name: "poll",
      type: {
        kind: "struct",
        fields: [
          { name: "pollId", type: "u64" },
          { name: "creator", type: "publicKey" },
          { name: "question", type: "string" },
          { name: "options", type: { vec: "string" } },
          { name: "votes", type: { vec: "u64" } },
          { name: "totalVotes", type: "u64" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "voterRecord",
      type: {
        kind: "struct",
        fields: [
          { name: "voter", type: "publicKey" },
          { name: "pollId", type: "u64" },
          { name: "chosenOption", type: "u8" },
          { name: "votedAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ],
  errors: [
    { code: 6000, name: "InvalidQuestion", msg: "Question must be between 1 and 200 characters" },
    { code: 6001, name: "InvalidOptions", msg: "Must have between 2 and 10 options" },
    { code: 6002, name: "InvalidOptionText", msg: "Option text must be between 1 and 50 characters" },
    { code: 6003, name: "InvalidOptionIndex", msg: "Invalid option index" }
  ]
};
