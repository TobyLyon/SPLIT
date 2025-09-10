export type SplitSquads = {
  "version": "0.1.0",
  "name": "splitsquads",
  "instructions": [
    {
      "name": "initializeSquad",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardsVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "maxMembers",
          "type": "u8"
        }
      ]
    },
    {
      "name": "joinSquad",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stakeTokens",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateActivityScore",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squad",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "memberPubkey",
          "type": "publicKey"
        },
        {
          "name": "newScore",
          "type": "u32"
        }
      ]
    },
    {
      "name": "distributeRewards",
      "accounts": [
        {
          "name": "squad",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "squad",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "maxMembers",
            "type": "u8"
          },
          {
            "name": "memberCount",
            "type": "u8"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "rewardsVault",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "squad",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "joinTimestamp",
            "type": "i64"
          },
          {
            "name": "lastActivityTimestamp",
            "type": "i64"
          },
          {
            "name": "activityScore",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSquadSize",
      "msg": "Squad size must be between 2 and 8 members"
    },
    {
      "code": 6001,
      "name": "NameTooLong",
      "msg": "Name is too long"
    },
    {
      "code": 6002,
      "name": "SquadFull",
      "msg": "Squad is full"
    },
    {
      "code": 6003,
      "name": "InvalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6004,
      "name": "InsufficientStake",
      "msg": "Insufficient stake"
    },
    {
      "code": 6005,
      "name": "UnauthorizedOracle",
      "msg": "Unauthorized oracle"
    },
    {
      "code": 6006,
      "name": "NoMembers",
      "msg": "No members in squad"
    },
    {
      "code": 6007,
      "name": "NoRewards",
      "msg": "No rewards to distribute"
    },
    {
      "code": 6008,
      "name": "ZeroTotalWeight",
      "msg": "Zero total weight"
    },
    {
      "code": 6009,
      "name": "Overflow",
      "msg": "Math overflow"
    },
    {
      "code": 6010,
      "name": "Underflow",
      "msg": "Math underflow"
    },
    {
      "code": 6011,
      "name": "DivisionByZero",
      "msg": "Division by zero"
    }
  ]
};

export const IDL: SplitSquads = {
  "version": "0.1.0",
  "name": "splitsquads",
  "instructions": [
    {
      "name": "initializeSquad",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardsVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "maxMembers",
          "type": "u8"
        }
      ]
    },
    {
      "name": "joinSquad",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stakeTokens",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "accounts": [
        {
          "name": "squad",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateActivityScore",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squad",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "memberPubkey",
          "type": "publicKey"
        },
        {
          "name": "newScore",
          "type": "u32"
        }
      ]
    },
    {
      "name": "distributeRewards",
      "accounts": [
        {
          "name": "squad",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "squad",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "maxMembers",
            "type": "u8"
          },
          {
            "name": "memberCount",
            "type": "u8"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "rewardsVault",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "squad",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "joinTimestamp",
            "type": "i64"
          },
          {
            "name": "lastActivityTimestamp",
            "type": "i64"
          },
          {
            "name": "activityScore",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSquadSize",
      "msg": "Squad size must be between 2 and 8 members"
    },
    {
      "code": 6001,
      "name": "NameTooLong",
      "msg": "Name is too long"
    },
    {
      "code": 6002,
      "name": "SquadFull",
      "msg": "Squad is full"
    },
    {
      "code": 6003,
      "name": "InvalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6004,
      "name": "InsufficientStake",
      "msg": "Insufficient stake"
    },
    {
      "code": 6005,
      "name": "UnauthorizedOracle",
      "msg": "Unauthorized oracle"
    },
    {
      "code": 6006,
      "name": "NoMembers",
      "msg": "No members in squad"
    },
    {
      "code": 6007,
      "name": "NoRewards",
      "msg": "No rewards to distribute"
    },
    {
      "code": 6008,
      "name": "ZeroTotalWeight",
      "msg": "Zero total weight"
    },
    {
      "code": 6009,
      "name": "Overflow",
      "msg": "Math overflow"
    },
    {
      "code": 6010,
      "name": "Underflow",
      "msg": "Math underflow"
    },
    {
      "code": 6011,
      "name": "DivisionByZero",
      "msg": "Division by zero"
    }
  ]
};