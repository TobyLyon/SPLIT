import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddressSync 
} from '@solana/spl-token';
import { SplitSquads } from '../../packages/sdk/src/idl';
import { expect } from 'chai';

describe('SplitSquads Program Tests', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Splitsquads as Program<SplitSquads>;
  const payer = provider.wallet as anchor.Wallet;

  let mint: PublicKey;
  let squadAuthority: Keypair;
  let member1: Keypair;
  let member2: Keypair;
  let squadPda: PublicKey;
  let rewardsVaultPda: PublicKey;
  let squadVaultPda: PublicKey;

  before(async () => {
    // Create test keypairs
    squadAuthority = Keypair.generate();
    member1 = Keypair.generate();
    member2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(squadAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(member1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(member2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Create test token mint
    mint = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      payer.publicKey,
      6 // 6 decimals
    );

    // Derive PDAs
    const squadName = 'Test Squad';
    [squadPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('squad'), squadAuthority.publicKey.toBuffer(), Buffer.from(squadName)],
      program.programId
    );

    [rewardsVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('rewards_vault'), squadPda.toBuffer()],
      program.programId
    );

    [squadVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('squad_vault'), squadPda.toBuffer()],
      program.programId
    );
  });

  describe('Squad Management', () => {
    it('should initialize a squad successfully', async () => {
      const squadName = 'Test Squad';
      const maxMembers = 4;

      const tx = await program.methods
        .initializeSquad(squadName, maxMembers)
        .accounts({
          squad: squadPda,
          rewardsVault: rewardsVaultPda,
          mint: mint,
          authority: squadAuthority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([squadAuthority])
        .rpc();

      // Verify squad was created correctly
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.authority.toString()).to.equal(squadAuthority.publicKey.toString());
      expect(squadAccount.name).to.equal(squadName);
      expect(squadAccount.maxMembers).to.equal(maxMembers);
      expect(squadAccount.memberCount).to.equal(0);
      expect(squadAccount.totalStaked.toNumber()).to.equal(0);
    });

    it('should fail to initialize squad with invalid size', async () => {
      const invalidSquadName = 'Invalid Squad';
      const invalidMaxMembers = 10; // > 8, should fail

      try {
        await program.methods
          .initializeSquad(invalidSquadName, invalidMaxMembers)
          .accounts({
            squad: Keypair.generate().publicKey, // Different PDA
            rewardsVault: Keypair.generate().publicKey,
            mint: mint,
            authority: squadAuthority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([squadAuthority])
          .rpc();
        
        expect.fail('Should have failed with invalid squad size');
      } catch (error) {
        expect(error.error.errorCode.code).to.equal('InvalidSquadSize');
      }
    });
  });

  describe('Member Management', () => {
    let member1Pda: PublicKey;
    let member2Pda: PublicKey;

    before(() => {
      [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), squadPda.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      [member2Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), squadPda.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );
    });

    it('should allow member to join squad', async () => {
      const tx = await program.methods
        .joinSquad()
        .accounts({
          squad: squadPda,
          member: member1Pda,
          authority: member1.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([member1])
        .rpc();

      // Verify member was added
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.squad.toString()).to.equal(squadPda.toString());
      expect(memberAccount.authority.toString()).to.equal(member1.publicKey.toString());
      expect(memberAccount.stakeAmount.toNumber()).to.equal(0);

      // Verify squad member count increased
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.memberCount).to.equal(1);
    });

    it('should allow second member to join squad', async () => {
      await program.methods
        .joinSquad()
        .accounts({
          squad: squadPda,
          member: member2Pda,
          authority: member2.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([member2])
        .rpc();

      // Verify squad member count increased
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.memberCount).to.equal(2);
    });
  });

  describe('Token Staking', () => {
    let member1TokenAccount: PublicKey;
    let member2TokenAccount: PublicKey;
    let member1Pda: PublicKey;
    let member2Pda: PublicKey;

    before(async () => {
      [member1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), squadPda.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      [member2Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), squadPda.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );

      // Create token accounts for members
      member1TokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        payer.payer,
        mint,
        member1.publicKey
      );

      member2TokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        payer.payer,
        mint,
        member2.publicKey
      );

      // Mint tokens to members
      await mintTo(
        provider.connection,
        payer.payer,
        mint,
        member1TokenAccount,
        payer.payer,
        10000 * 10**6 // 10,000 tokens with 6 decimals
      );

      await mintTo(
        provider.connection,
        payer.payer,
        mint,
        member2TokenAccount,
        payer.payer,
        5000 * 10**6 // 5,000 tokens with 6 decimals
      );
    });

    it('should allow member to stake tokens', async () => {
      const stakeAmount = new BN(1000 * 10**6); // 1,000 tokens

      await program.methods
        .stakeTokens(stakeAmount)
        .accounts({
          squad: squadPda,
          member: member1Pda,
          squadVault: squadVaultPda,
          memberTokenAccount: member1TokenAccount,
          mint: mint,
          authority: member1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();

      // Verify member stake was updated
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.stakeAmount.toString()).to.equal(stakeAmount.toString());

      // Verify squad total stake was updated
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.totalStaked.toString()).to.equal(stakeAmount.toString());
    });

    it('should allow second member to stake tokens', async () => {
      const stakeAmount = new BN(2000 * 10**6); // 2,000 tokens

      await program.methods
        .stakeTokens(stakeAmount)
        .accounts({
          squad: squadPda,
          member: member2Pda,
          squadVault: squadVaultPda,
          memberTokenAccount: member2TokenAccount,
          mint: mint,
          authority: member2.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member2])
        .rpc();

      // Verify total squad stake
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.totalStaked.toString()).to.equal(new BN(3000 * 10**6).toString());
    });

    it('should allow member to unstake tokens', async () => {
      const unstakeAmount = new BN(500 * 10**6); // 500 tokens

      await program.methods
        .unstakeTokens(unstakeAmount)
        .accounts({
          squad: squadPda,
          member: member1Pda,
          squadVault: squadVaultPda,
          memberTokenAccount: member1TokenAccount,
          mint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([member1])
        .rpc();

      // Verify member stake was reduced
      const memberAccount = await program.account.member.fetch(member1Pda);
      expect(memberAccount.stakeAmount.toString()).to.equal(new BN(500 * 10**6).toString());

      // Verify squad total stake was reduced
      const squadAccount = await program.account.squad.fetch(squadPda);
      expect(squadAccount.totalStaked.toString()).to.equal(new BN(2500 * 10**6).toString());
    });

    it('should fail to unstake more than staked amount', async () => {
      const excessiveAmount = new BN(1000 * 10**6); // More than member1's current stake

      try {
        await program.methods
          .unstakeTokens(excessiveAmount)
          .accounts({
            squad: squadPda,
            member: member1Pda,
            squadVault: squadVaultPda,
            memberTokenAccount: member1TokenAccount,
            mint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([member1])
          .rpc();

        expect.fail('Should have failed with insufficient stake');
      } catch (error) {
        expect(error.error.errorCode.code).to.equal('InsufficientStake');
      }
    });
  });

  describe('Weight Calculation', () => {
    it('should calculate member weights correctly', async () => {
      // This would test the weight calculation logic
      // For now, we'll just verify the basic math works
      const stakeAmount = new BN(1000);
      const tenureSeconds = 30 * 24 * 60 * 60; // 30 days
      const squadSize = 2;
      const activityScore = 75;

      // These calculations mirror the Rust implementation
      const baseWeight = stakeAmount.div(new BN(1_000_000));
      const tenureMultiplier = tenureSeconds >= (90 * 24 * 60 * 60) 
        ? 200 
        : 100 + Math.floor((tenureSeconds * 100) / (90 * 24 * 60 * 60));
      const squadMultiplier = 100 + (squadSize - 2) * 4;
      const activityMultiplier = 50 + Math.min(activityScore, 100);

      const expectedWeight = baseWeight
        .mul(new BN(tenureMultiplier))
        .mul(new BN(squadMultiplier))
        .mul(new BN(activityMultiplier))
        .div(new BN(100_000_000));

      // In a real test, we'd call a view function to get the calculated weight
      // and compare it to our expected result
      expect(expectedWeight.toNumber()).to.be.greaterThan(0);
    });
  });
});