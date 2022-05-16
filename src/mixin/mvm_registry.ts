export const registryAddress = '0x65ccF8d1B92AfC6aF2915Cb61e72d93ACdD16556';

export const registryProcess = '86c58765-ec81-3ca4-a35b-875f35a0ad7d';

export const registryAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'raw',
        type: 'bytes',
      },
      {
        internalType: 'uint128',
        name: 'pid',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'at',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'AssetCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'nonce',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'asset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'extra',
            type: 'bytes',
          },
          {
            internalType: 'uint64',
            name: 'timestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint256[2]',
            name: 'sig',
            type: 'uint256[2]',
          },
        ],
        indexed: false,
        internalType: 'struct Registry.Event',
        name: 'evt',
        type: 'tuple',
      },
    ],
    name: 'MixinEvent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'MixinTransaction',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'at',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'members',
        type: 'bytes',
      },
    ],
    name: 'UserCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'GROUP',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'INBOUND',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'OUTBOUND',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PID',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERSION',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'assets',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'burn',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'claim',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'contracts',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'raw',
        type: 'bytes',
      },
    ],
    name: 'iterate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'raw',
        type: 'bytes',
      },
    ],
    name: 'mixin',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'users',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'values',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_key',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'raw',
        type: 'bytes',
      },
    ],
    name: 'writeValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
