import { bsc, bscTestnet } from 'viem/chains';

export const CHAIN_CONFIGS = {
  bsc: {
    chain: bsc,
    rpcUrl: 'https://bnb-mainnet.g.alchemy.com/v2/XQAa0JjXMHCm5fyFr1cTq-NdtNWsoO7P',
  },
  bscTestnet: {
    chain: bscTestnet,
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
  },

};
