import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SPLIT_TOKEN_MINT } from '@/config/constants';

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  return useQuery({
    queryKey: ['wallet', 'balance', publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey || !connected) return null;
      
      try {
        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        
        // Get SPLIT token balance
        let splitBalance = 0;
        try {
          const tokenAccount = getAssociatedTokenAddressSync(SPLIT_TOKEN_MINT, publicKey);
          const account = await getAccount(connection, tokenAccount);
          splitBalance = Number(account.amount) / 1_000_000; // Convert from 6 decimals
        } catch (error) {
          // Token account doesn't exist, balance is 0
          splitBalance = 0;
        }
        
        return {
          sol: solBalance / LAMPORTS_PER_SOL,
          split: splitBalance,
          publicKey: publicKey.toString(),
        };
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return null;
      }
    },
    enabled: !!publicKey && connected,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useHasSufficientBalance(requiredAmount: number) {
  const { data: balance } = useWalletBalance();
  
  return {
    hasSufficientSol: (balance?.sol ?? 0) >= 0.01, // Minimum SOL for transactions
    hasSufficientSplit: (balance?.split ?? 0) >= requiredAmount,
    solBalance: balance?.sol ?? 0,
    splitBalance: balance?.split ?? 0,
  };
}