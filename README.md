# SplitSquads 🚀

**Rewards-Sharing Social Staking on Solana**

SplitSquads is a production-ready, end-to-end decentralized application that implements rewards-sharing social staking on Solana. Users can form or join squads (2-8 members), stake $SPLIT tokens, and earn rewards based on dynamic weight calculations that consider stake amount, tenure, squad size, and activity scores.

## ✨ Features

- **Squad Formation**: Create or join squads with 2-8 members
- **Dynamic Weight System**: Earn rewards based on:
  - Base stake weight (proportional to stake amount)
  - Tenure multiplier (longer staking = higher rewards, capped at 2x after 90 days)
  - Squad size multiplier (larger squads get bonuses up to 1.2x for 8 members)
  - Activity multiplier (off-chain engagement score from 0.5x to 1.5x)
- **Competitive Leaderboards**: Global rankings for squads and individual members
- **Twitter Integration**: Proof-of-ownership verification via signed tweets
- **Glassmorphic UI**: Beautiful, modern interface with arcade-style micro-accents
- **Multi-Wallet Support**: Phantom, Solflare, Backpack, Ledger, and more
- **Real-time Updates**: Live activity feeds and reward distributions

## 🏗 Architecture

### Monorepo Structure
```
splitsquads/
├── programs/splitsquads/     # Solana Anchor program
├── packages/sdk/             # TypeScript client SDK
├── app/                      # Next.js 14 frontend
├── infra/                    # Infrastructure & deployment
├── tests/                    # Comprehensive test suite
└── scripts/                  # Deployment & setup scripts
```

### Tech Stack

**Blockchain & Smart Contracts:**
- Solana blockchain
- Anchor framework (Rust)
- SPL Token standard

**Frontend:**
- Next.js 14 with App Router
- React 18 with TypeScript
- TailwindCSS + shadcn/ui
- Framer Motion animations
- @solana/wallet-adapter

**Backend & Database:**
- Supabase (PostgreSQL)
- Next.js API routes
- Real-time subscriptions

**Testing & Quality:**
- Anchor testing framework
- Vitest for unit/integration tests
- Playwright for E2E tests
- ESLint + Prettier + Husky

**Deployment & DevOps:**
- GitHub Actions CI/CD
- Vercel (frontend)
- Automated program deployment
- NPM package publishing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.18.22+
- Git

### Automated Setup

```bash
# Clone the repository
git clone https://github.com/your-org/splitsquads.git
cd splitsquads

# Run the setup script (installs all dependencies and tools)
./scripts/setup-env.sh

# Update environment variables
# Edit .env and app/.env.local with your configuration
```

### Manual Setup

1. **Install Dependencies**
```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

2. **Install Solana Tools**
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest && avm use latest

# Generate keypair and configure Solana
solana-keygen new --no-bip39-passphrase
solana config set --url devnet
solana airdrop 2
```

3. **Setup Environment Variables**
```bash
# Copy environment templates
cp app/.env.example app/.env.local
cp .env.example .env

# Update with your configuration
```

4. **Setup Supabase Database**
```bash
# Create a Supabase project and run the schema
# Copy the SQL from infra/supabase/schema.sql to your Supabase SQL editor
```

5. **Build and Deploy**
```bash
# Deploy to devnet
./scripts/deploy.sh --network devnet

# Start development server
pnpm dev
```

## 🧪 Testing

### Run All Tests
```bash
pnpm test:all
```

### Individual Test Suites
```bash
# Anchor program tests
pnpm test:program

# SDK integration tests
pnpm test:integration

# End-to-end tests
pnpm test:e2e
```

## 🔧 Development

### Start Development Environment
```bash
# Start all services
pnpm dev

# Individual services
pnpm --filter app dev          # Frontend only
pnpm --filter sdk dev          # SDK build watch
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Type check
pnpm typecheck

# Format code
pnpm format
```

## 📦 Project Structure

### Anchor Program (`/programs/splitsquads`)

The core Solana program implementing:
- Squad creation and management
- Member joining and leaving
- Token staking and unstaking
- Reward distribution with dynamic weights
- Activity score updates from oracle

**Key Instructions:**
- `initialize_squad`: Create a new squad
- `join_squad`: Join an existing squad
- `stake_tokens`: Stake $SPLIT tokens
- `unstake_tokens`: Withdraw staked tokens
- `distribute_rewards`: Distribute rewards based on weights
- `update_activity_score`: Oracle updates for activity scores

### SDK Package (`/packages/sdk`)

TypeScript client library providing:
- Easy-to-use program interaction methods
- PDA derivation utilities
- Weight calculation helpers
- Type-safe interfaces

```typescript
import { SplitSquadsClient } from '@splitsquads/sdk';

const client = new SplitSquadsClient(connection, wallet);
await client.initializeSquad('My Squad', 6, mintAddress);
```

### Frontend App (`/app`)

Next.js 14 application featuring:
- **Glassmorphic Design**: Beautiful UI with backdrop blur effects
- **Responsive Layout**: Mobile-first design with smooth animations
- **Wallet Integration**: Support for 7+ Solana wallets
- **Real-time Updates**: Live activity feeds and balance updates
- **Twitter Integration**: Social proof-of-ownership system

**Key Pages:**
- `/`: Landing page with features and stats
- `/dashboard`: User dashboard with squad overview
- `/squads`: Squad discovery and creation
- `/leaderboard`: Global rankings
- `/u/[handle]`: User profiles
- `/squad/[slug]`: Squad details

### Database Schema (`/infra/supabase`)

PostgreSQL schema with:
- `squad_metadata`: Squad information and metadata
- `user_profiles`: User profiles with Twitter integration
- `activity_scores`: Off-chain activity tracking
- `leaderboard`: Precomputed rankings for performance
- `twitter_proofs`: Twitter verification system

## 🚀 Deployment

### Development Deployment
```bash
./scripts/deploy.sh --network devnet
```

### Production Deployment
```bash
./scripts/deploy.sh --network mainnet
```

### CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs linting and type checking
2. Executes all test suites
3. Builds and deploys the Anchor program
4. Deploys frontend to Vercel
5. Publishes SDK to NPM
6. Sends deployment notifications

## 🔐 Security Features

- **Program Security**: Proper PDA derivation, signer verification, overflow protection
- **Web Security**: Input validation with Zod, rate limiting, CORS hardening
- **Oracle Security**: Cryptographic signature verification for activity updates
- **Wallet Security**: Non-custodial design, user controls private keys

## 🎨 Design System

### Brand Colors
- **Background**: Deep dark `#0A0F14`
- **Accent Mint**: `#4EF2C4` (primary actions)
- **Accent Violet**: `#8A7CFF` (secondary actions)
- **Glass**: `rgba(255, 255, 255, 0.06)` with 18px backdrop blur

### Typography
- **Primary**: Inter (clean, modern)
- **Monospace**: JetBrains Mono (stats, addresses)
- **Numbers**: Tabular lining for consistent alignment

### Components
- Glassmorphic cards with subtle borders
- Smooth hover animations and micro-interactions
- Neon glow effects on important elements
- Arcade-style badges for achievements

## 📊 Weight Calculation

Rewards are distributed based on a member's calculated weight:

```
Weight = BaseWeight × TenureMultiplier × SquadMultiplier × ActivityMultiplier
```

- **BaseWeight**: Proportional to staked amount
- **TenureMultiplier**: 1.0x to 2.0x based on continuous staking duration
- **SquadMultiplier**: 1.0x to 1.2x based on squad size (2-8 members)
- **ActivityMultiplier**: 0.5x to 1.5x based on engagement score (0-100)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (enforced by ESLint/Prettier)
- Add tests for new features
- Update documentation for API changes
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: https://splitsquads.com
- **Twitter**: https://twitter.com/splitsquads
- **Discord**: https://discord.gg/splitsquads
- **Documentation**: https://docs.splitsquads.com

## 🙏 Acknowledgments

- Solana Foundation for the robust blockchain infrastructure
- Anchor framework for simplifying Solana development
- The open-source community for amazing tools and libraries

---

**Built with ❤️ on Solana**