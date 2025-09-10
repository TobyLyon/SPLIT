import { AnchorProvider, Program, web3, BN, utils } from '@coral-xyz/anchor';
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IDL, SplitSquads } from './idl';
import { Squad, Member, SquadData, MemberData } from './types';

export class SplitSquadsClient {
  public program: Program<SplitSquads>;
  public provider: AnchorProvider;

  constructor(
    connection: Connection,
    wallet: WalletContextState,
    programId: PublicKey = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
  ) {
    this.provider = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });
    this.program = new Program(IDL, programId, this.provider);
  }

  // Helper methods for deriving PDAs
  public getSquadPDA(authority: PublicKey, name: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('squad'), authority.toBuffer(), Buffer.from(name)],
      this.program.programId
    );
  }

  public getMemberPDA(squad: PublicKey, authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('member'), squad.toBuffer(), authority.toBuffer()],
      this.program.programId
    );
  }

  public getRewardsVaultPDA(squad: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('rewards_vault'), squad.toBuffer()],
      this.program.programId
    );
  }

  public getSquadVaultPDA(squad: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('squad_vault'), squad.toBuffer()],
      this.program.programId
    );
  }

  // Squad operations
  public async initializeSquad(
    name: string,
    maxMembers: number,
    mint: PublicKey
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [squad] = this.getSquadPDA(authority, name);
    const [rewardsVault] = this.getRewardsVaultPDA(squad);

    const tx = await this.program.methods
      .initializeSquad(name, maxMembers)
      .accounts({
        squad,
        rewardsVault,
        mint,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  public async joinSquad(squadPubkey: PublicKey): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [member] = this.getMemberPDA(squadPubkey, authority);

    const tx = await this.program.methods
      .joinSquad()
      .accounts({
        squad: squadPubkey,
        member,
        authority,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  public async stakeTokens(
    squadPubkey: PublicKey,
    amount: BN,
    mint: PublicKey
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [member] = this.getMemberPDA(squadPubkey, authority);
    const [squadVault] = this.getSquadVaultPDA(squadPubkey);
    const memberTokenAccount = getAssociatedTokenAddressSync(mint, authority);

    const tx = await this.program.methods
      .stakeTokens(amount)
      .accounts({
        squad: squadPubkey,
        member,
        squadVault,
        memberTokenAccount,
        mint,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  public async unstakeTokens(
    squadPubkey: PublicKey,
    amount: BN,
    mint: PublicKey
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [member] = this.getMemberPDA(squadPubkey, authority);
    const [squadVault] = this.getSquadVaultPDA(squadPubkey);
    const memberTokenAccount = getAssociatedTokenAddressSync(mint, authority);

    const tx = await this.program.methods
      .unstakeTokens(amount)
      .accounts({
        squad: squadPubkey,
        member,
        squadVault,
        memberTokenAccount,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  public async distributeRewards(
    squadPubkey: PublicKey,
    mint: PublicKey,
    members: { member: PublicKey; tokenAccount: PublicKey }[]
  ): Promise<string> {
    const [rewardsVault] = this.getRewardsVaultPDA(squadPubkey);

    const remainingAccounts = members.flatMap(({ member, tokenAccount }) => [
      { pubkey: member, isWritable: false, isSigner: false },
      { pubkey: tokenAccount, isWritable: true, isSigner: false },
    ]);

    const tx = await this.program.methods
      .distributeRewards()
      .accounts({
        squad: squadPubkey,
        rewardsVault,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(remainingAccounts)
      .rpc();

    return tx;
  }

  // Data fetching methods
  public async getSquad(squadPubkey: PublicKey): Promise<Squad | null> {
    try {
      const account = await this.program.account.squad.fetch(squadPubkey);
      return {
        pubkey: squadPubkey,
        data: account as SquadData,
      };
    } catch {
      return null;
    }
  }

  public async getMember(memberPubkey: PublicKey): Promise<Member | null> {
    try {
      const account = await this.program.account.member.fetch(memberPubkey);
      return {
        pubkey: memberPubkey,
        data: account as MemberData,
      };
    } catch {
      return null;
    }
  }

  public async getSquadsByAuthority(authority: PublicKey): Promise<Squad[]> {
    const squads = await this.program.account.squad.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: authority.toBase58(),
        },
      },
    ]);

    return squads.map((squad) => ({
      pubkey: squad.publicKey,
      data: squad.account as SquadData,
    }));
  }

  public async getMembersBySquad(squadPubkey: PublicKey): Promise<Member[]> {
    const members = await this.program.account.member.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: squadPubkey.toBase58(),
        },
      },
    ]);

    return members.map((member) => ({
      pubkey: member.publicKey,
      data: member.account as MemberData,
    }));
  }

  public async getAllSquads(): Promise<Squad[]> {
    const squads = await this.program.account.squad.all();
    return squads.map((squad) => ({
      pubkey: squad.publicKey,
      data: squad.account as SquadData,
    }));
  }

  // Utility methods
  public async createAssociatedTokenAccount(
    mint: PublicKey,
    owner: PublicKey = this.provider.wallet.publicKey!
  ): Promise<TransactionInstruction> {
    const associatedToken = getAssociatedTokenAddressSync(mint, owner);
    
    return createAssociatedTokenAccountInstruction(
      this.provider.wallet.publicKey!, // payer
      associatedToken, // ata
      owner, // owner
      mint // mint
    );
  }

  public calculateMemberWeight(
    stakeAmount: BN,
    tenureSeconds: number,
    squadSize: number,
    activityScore: number
  ): BN {
    // Base stake weight (normalized)
    const baseWeight = stakeAmount.div(new BN(1_000_000));

    // Tenure multiplier (max 2x after 90 days)
    const maxTenureSeconds = 90 * 24 * 60 * 60;
    const tenureMultiplier = tenureSeconds >= maxTenureSeconds 
      ? 200 
      : 100 + Math.floor((tenureSeconds * 100) / maxTenureSeconds);

    // Squad size multiplier (larger squads get small bonus, max 1.2x for 8 members)
    const squadMultiplier = 100 + (squadSize - 2) * 4;

    // Activity multiplier (score 0-100 maps to 0.5x to 1.5x)
    const activityMultiplier = 50 + Math.min(activityScore, 100);

    // Calculate final weight
    return baseWeight
      .mul(new BN(tenureMultiplier))
      .mul(new BN(squadMultiplier))
      .mul(new BN(activityMultiplier))
      .div(new BN(100_000_000));
  }
}