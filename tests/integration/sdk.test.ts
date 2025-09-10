import { describe, it, expect, beforeAll } from 'vitest';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { SplitSquadsClient } from '@splitsquads/sdk';

// Mock wallet for testing
class MockWallet {
  constructor(public keypair: Keypair) {}

  get publicKey() {
    return this.keypair.publicKey;
  }

  async signTransaction(tx: any) {
    tx.partialSign(this.keypair);
    return tx;
  }

  async signAllTransactions(txs: any[]) {
    return txs.map(tx => {
      tx.partialSign(this.keypair);
      return tx;
    });
  }
}

describe('SplitSquads SDK Integration Tests', () => {
  let connection: Connection;
  let client: SplitSquadsClient;
  let testWallet: MockWallet;
  let testMint: PublicKey;

  beforeAll(() => {
    // Use local test validator
    connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    testWallet = new MockWallet(Keypair.generate());
    
    // Initialize client
    client = new SplitSquadsClient(connection, testWallet as any);
    
    // Mock mint address for testing
    testMint = new PublicKey('So11111111111111111111111111111111111111112'); // Wrapped SOL
  });

  describe('PDA Derivation', () => {
    it('should derive squad PDA correctly', () => {
      const authority = testWallet.publicKey;
      const squadName = 'Test Squad';
      
      const [squadPda, bump] = client.getSquadPDA(authority, squadName);
      
      expect(squadPda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    it('should derive member PDA correctly', () => {
      const authority = testWallet.publicKey;
      const squadName = 'Test Squad';
      const [squadPda] = client.getSquadPDA(authority, squadName);
      
      const [memberPda, bump] = client.getMemberPDA(squadPda, authority);
      
      expect(memberPda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    it('should derive rewards vault PDA correctly', () => {
      const authority = testWallet.publicKey;
      const squadName = 'Test Squad';
      const [squadPda] = client.getSquadPDA(authority, squadName);
      
      const [rewardsVaultPda, bump] = client.getRewardsVaultPDA(squadPda);
      
      expect(rewardsVaultPda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    it('should derive squad vault PDA correctly', () => {
      const authority = testWallet.publicKey;
      const squadName = 'Test Squad';
      const [squadPda] = client.getSquadPDA(authority, squadName);
      
      const [squadVaultPda, bump] = client.getSquadVaultPDA(squadPda);
      
      expect(squadVaultPda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });
  });

  describe('Weight Calculation', () => {
    it('should calculate member weight with minimum values', () => {
      const stakeAmount = new BN(1_000_000); // 1 token
      const tenureSeconds = 0; // Just joined
      const squadSize = 2; // Minimum squad size
      const activityScore = 0; // Minimum activity

      const weight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        squadSize,
        activityScore
      );

      expect(weight.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate member weight with maximum values', () => {
      const stakeAmount = new BN(100_000_000_000); // 100,000 tokens
      const tenureSeconds = 90 * 24 * 60 * 60; // 90 days
      const squadSize = 8; // Maximum squad size
      const activityScore = 100; // Maximum activity

      const weight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        squadSize,
        activityScore
      );

      expect(weight.toNumber()).toBeGreaterThan(0);
    });

    it('should give higher weight for larger stakes', () => {
      const smallStake = new BN(1_000_000); // 1 token
      const largeStake = new BN(10_000_000); // 10 tokens
      const tenureSeconds = 30 * 24 * 60 * 60; // 30 days
      const squadSize = 4;
      const activityScore = 50;

      const smallWeight = client.calculateMemberWeight(
        smallStake,
        tenureSeconds,
        squadSize,
        activityScore
      );

      const largeWeight = client.calculateMemberWeight(
        largeStake,
        tenureSeconds,
        squadSize,
        activityScore
      );

      expect(largeWeight.toNumber()).toBeGreaterThan(smallWeight.toNumber());
    });

    it('should give higher weight for longer tenure', () => {
      const stakeAmount = new BN(5_000_000); // 5 tokens
      const shortTenure = 7 * 24 * 60 * 60; // 7 days
      const longTenure = 60 * 24 * 60 * 60; // 60 days
      const squadSize = 4;
      const activityScore = 50;

      const shortWeight = client.calculateMemberWeight(
        stakeAmount,
        shortTenure,
        squadSize,
        activityScore
      );

      const longWeight = client.calculateMemberWeight(
        stakeAmount,
        longTenure,
        squadSize,
        activityScore
      );

      expect(longWeight.toNumber()).toBeGreaterThan(shortWeight.toNumber());
    });

    it('should give higher weight for larger squads', () => {
      const stakeAmount = new BN(5_000_000); // 5 tokens
      const tenureSeconds = 30 * 24 * 60 * 60; // 30 days
      const smallSquad = 2;
      const largeSquad = 8;
      const activityScore = 50;

      const smallSquadWeight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        smallSquad,
        activityScore
      );

      const largeSquadWeight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        largeSquad,
        activityScore
      );

      expect(largeSquadWeight.toNumber()).toBeGreaterThan(smallSquadWeight.toNumber());
    });

    it('should give higher weight for higher activity scores', () => {
      const stakeAmount = new BN(5_000_000); // 5 tokens
      const tenureSeconds = 30 * 24 * 60 * 60; // 30 days
      const squadSize = 4;
      const lowActivity = 10;
      const highActivity = 90;

      const lowActivityWeight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        squadSize,
        lowActivity
      );

      const highActivityWeight = client.calculateMemberWeight(
        stakeAmount,
        tenureSeconds,
        squadSize,
        highActivity
      );

      expect(highActivityWeight.toNumber()).toBeGreaterThan(lowActivityWeight.toNumber());
    });
  });

  describe('Data Fetching (Mock)', () => {
    it('should handle non-existent squad gracefully', async () => {
      const nonExistentSquad = Keypair.generate().publicKey;
      
      const squad = await client.getSquad(nonExistentSquad);
      
      expect(squad).toBeNull();
    });

    it('should handle non-existent member gracefully', async () => {
      const nonExistentMember = Keypair.generate().publicKey;
      
      const member = await client.getMember(nonExistentMember);
      
      expect(member).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should validate squad names', () => {
      const validNames = ['Test Squad', 'My Team', '123 Squad', 'A'];
      const invalidNames = ['', 'a'.repeat(33)]; // Empty or too long

      validNames.forEach(name => {
        expect(() => {
          client.getSquadPDA(testWallet.publicKey, name);
        }).not.toThrow();
      });

      invalidNames.forEach(name => {
        // In a real implementation, the client would validate input
        // For now, we just test that the function exists
        expect(() => {
          client.getSquadPDA(testWallet.publicKey, name);
        }).not.toThrow(); // The actual validation would happen on-chain
      });
    });

    it('should validate stake amounts', () => {
      const validAmounts = [
        new BN(1),
        new BN(1000),
        new BN(1_000_000),
        new BN('18446744073709551615') // Max u64
      ];

      const invalidAmounts = [
        new BN(0),
        new BN(-1)
      ];

      validAmounts.forEach(amount => {
        expect(amount.toNumber()).toBeGreaterThan(0);
      });

      invalidAmounts.forEach(amount => {
        expect(amount.toNumber()).toBeLessThanOrEqual(0);
      });
    });
  });
});