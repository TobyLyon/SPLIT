import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, Connection } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { SplitSquadsClient } from '@splitsquads/sdk';
import { PROGRAM_ID, SPLIT_TOKEN_MINT, TRANSACTION_CONFIG } from '@/config/constants';
import { useNotifications } from './useNotifications';

// Create client instance
export function useSplitSquadsClient() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  return new SplitSquadsClient(connection, wallet, PROGRAM_ID);
}

// Squad data hooks
export function useSquad(squadPubkey: string | null) {
  const client = useSplitSquadsClient();
  
  return useQuery({
    queryKey: ['squad', squadPubkey],
    queryFn: async () => {
      if (!squadPubkey) return null;
      return client.getSquad(new PublicKey(squadPubkey));
    },
    enabled: !!squadPubkey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSquadsByAuthority(authority: PublicKey | null) {
  const client = useSplitSquadsClient();
  
  return useQuery({
    queryKey: ['squads', 'authority', authority?.toString()],
    queryFn: async () => {
      if (!authority) return [];
      return client.getSquadsByAuthority(authority);
    },
    enabled: !!authority,
    refetchInterval: 30000,
  });
}

export function useAllSquads() {
  const client = useSplitSquadsClient();
  
  return useQuery({
    queryKey: ['squads', 'all'],
    queryFn: () => client.getAllSquads(),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useMember(squadPubkey: string | null, authority: PublicKey | null) {
  const client = useSplitSquadsClient();
  
  return useQuery({
    queryKey: ['member', squadPubkey, authority?.toString()],
    queryFn: async () => {
      if (!squadPubkey || !authority) return null;
      const [memberPda] = client.getMemberPDA(new PublicKey(squadPubkey), authority);
      return client.getMember(memberPda);
    },
    enabled: !!squadPubkey && !!authority,
    refetchInterval: 30000,
  });
}

export function useSquadMembers(squadPubkey: string | null) {
  const client = useSplitSquadsClient();
  
  return useQuery({
    queryKey: ['members', squadPubkey],
    queryFn: async () => {
      if (!squadPubkey) return [];
      return client.getMembersBySquad(new PublicKey(squadPubkey));
    },
    enabled: !!squadPubkey,
    refetchInterval: 30000,
  });
}

// Transaction hooks
export function useCreateSquad() {
  const client = useSplitSquadsClient();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async ({ name, maxMembers }: { name: string; maxMembers: number }) => {
      if (!publicKey) throw new Error('Wallet not connected');
      
      const tx = await client.initializeSquad(name, maxMembers, SPLIT_TOKEN_MINT);
      return tx;
    },
    onSuccess: (tx) => {
      addNotification({
        type: 'success',
        title: 'Squad Created!',
        message: 'Your squad has been successfully created.',
        txHash: tx,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Create Squad',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

export function useJoinSquad() {
  const client = useSplitSquadsClient();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async (squadPubkey: string) => {
      if (!publicKey) throw new Error('Wallet not connected');
      
      const tx = await client.joinSquad(new PublicKey(squadPubkey));
      return { tx, squadPubkey };
    },
    onSuccess: ({ tx, squadPubkey }) => {
      addNotification({
        type: 'success',
        title: 'Joined Squad!',
        message: 'You have successfully joined the squad.',
        txHash: tx,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['squad', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['members', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['squads', 'authority'] });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Join Squad',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

export function useStakeTokens() {
  const client = useSplitSquadsClient();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async ({ squadPubkey, amount }: { squadPubkey: string; amount: number }) => {
      if (!publicKey) throw new Error('Wallet not connected');
      
      const amountBN = new BN(amount * 1_000_000); // Convert to 6 decimals
      const tx = await client.stakeTokens(new PublicKey(squadPubkey), amountBN, SPLIT_TOKEN_MINT);
      return { tx, squadPubkey, amount };
    },
    onSuccess: ({ tx, squadPubkey, amount }) => {
      addNotification({
        type: 'success',
        title: 'Tokens Staked!',
        message: `Successfully staked ${amount} SPLIT tokens.`,
        txHash: tx,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['squad', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['member', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Stake Tokens',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

export function useUnstakeTokens() {
  const client = useSplitSquadsClient();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async ({ squadPubkey, amount }: { squadPubkey: string; amount: number }) => {
      if (!publicKey) throw new Error('Wallet not connected');
      
      const amountBN = new BN(amount * 1_000_000); // Convert to 6 decimals
      const tx = await client.unstakeTokens(new PublicKey(squadPubkey), amountBN, SPLIT_TOKEN_MINT);
      return { tx, squadPubkey, amount };
    },
    onSuccess: ({ tx, squadPubkey, amount }) => {
      addNotification({
        type: 'success',
        title: 'Tokens Unstaked!',
        message: `Successfully unstaked ${amount} SPLIT tokens.`,
        txHash: tx,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['squad', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['member', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Unstake Tokens',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

export function useDistributeRewards() {
  const client = useSplitSquadsClient();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      squadPubkey, 
      members 
    }: { 
      squadPubkey: string; 
      members: { member: PublicKey; tokenAccount: PublicKey }[] 
    }) => {
      const tx = await client.distributeRewards(
        new PublicKey(squadPubkey), 
        SPLIT_TOKEN_MINT, 
        members
      );
      return { tx, squadPubkey };
    },
    onSuccess: ({ tx, squadPubkey }) => {
      addNotification({
        type: 'success',
        title: 'Rewards Distributed!',
        message: 'Squad rewards have been successfully distributed.',
        txHash: tx,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['squad', squadPubkey] });
      queryClient.invalidateQueries({ queryKey: ['members', squadPubkey] });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Distribute Rewards',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}