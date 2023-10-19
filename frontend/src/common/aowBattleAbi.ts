export const AoWBattleABI = {
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "battleId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "address",
              name: "player",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "playerTokenId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "playerHP",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "enemyHP",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "battleInProgress",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "winner",
              type: "bool",
            },
          ],
          indexed: false,
          internalType: "struct AoWBattle.Battle",
          name: "battle",
          type: "tuple",
        },
      ],
      name: "Battles",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_battleId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "_isPlayer",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_playerHP",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_enemyHP",
          type: "uint256",
        },
      ],
      name: "Attacked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_battleId",
          type: "uint256",
        },
      ],
      name: "Joined",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_battleId",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "skill",
          type: "uint8",
        },
      ],
      name: "attack",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "battleId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "battles",
      outputs: [
        {
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "playerTokenId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "playerHP",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "enemyHP",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "battleInProgress",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "winner",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "join",
      outputs: [
        {
          internalType: "uint256",
          name: "battleId_",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
