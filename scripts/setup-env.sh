#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 SplitSquads Environment Setup${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on supported OS
check_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    print_status "Operating system: $OS"
}

# Install Node.js and pnpm
install_node() {
    echo -e "${BLUE}Installing Node.js and pnpm...${NC}"
    
    if ! command -v node &> /dev/null; then
        if [[ "$OS" == "macos" ]]; then
            # Install via Homebrew
            if command -v brew &> /dev/null; then
                brew install node
            else
                print_error "Homebrew not found. Please install Node.js 18+ manually."
                exit 1
            fi
        else
            # Install via NodeSource
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    fi
    
    # Install pnpm
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm
    fi
    
    print_status "Node.js $(node --version) and pnpm $(pnpm --version) installed"
}

# Install Rust
install_rust() {
    echo -e "${BLUE}Installing Rust...${NC}"
    
    if ! command -v rustc &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source $HOME/.cargo/env
    fi
    
    # Update to latest stable
    rustup update stable
    rustup default stable
    
    print_status "Rust $(rustc --version) installed"
}

# Install Solana CLI
install_solana() {
    echo -e "${BLUE}Installing Solana CLI...${NC}"
    
    if ! command -v solana &> /dev/null; then
        sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
    
    print_status "Solana CLI $(solana --version) installed"
}

# Install Anchor
install_anchor() {
    echo -e "${BLUE}Installing Anchor...${NC}"
    
    if ! command -v anchor &> /dev/null; then
        cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
        avm install latest
        avm use latest
    fi
    
    print_status "Anchor $(anchor --version) installed"
}

# Setup Solana keypairs
setup_solana_keypairs() {
    echo -e "${BLUE}Setting up Solana keypairs...${NC}"
    
    # Create keypair directory
    mkdir -p ~/.config/solana
    
    # Generate keypair if it doesn't exist
    if [ ! -f ~/.config/solana/id.json ]; then
        solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/id.json
        print_status "New Solana keypair generated"
    else
        print_status "Existing Solana keypair found"
    fi
    
    # Set config to use devnet by default
    solana config set --url devnet
    
    # Show public key
    echo -e "${BLUE}Your Solana public key: $(solana address)${NC}"
    
    # Airdrop some SOL for development
    echo -e "${BLUE}Requesting airdrop...${NC}"
    solana airdrop 2 || print_warning "Airdrop failed - you may need to request SOL manually"
}

# Install development tools
install_dev_tools() {
    echo -e "${BLUE}Installing development tools...${NC}"
    
    # Install global packages
    pnpm add -g @playwright/test typescript ts-node
    
    print_status "Development tools installed"
}

# Setup environment files
setup_env_files() {
    echo -e "${BLUE}Setting up environment files...${NC}"
    
    # App environment file
    if [ ! -f ./app/.env.local ]; then
        cat > ./app/.env.local << EOF
# Solana Configuration
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Supabase Configuration (replace with your values)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Oracle Configuration
ORACLE_PUBLIC_KEY=your-oracle-public-key-here

# Background Job API Key
BACKGROUND_JOB_API_KEY=your-background-job-api-key-here
EOF
        print_status "Created app/.env.local"
    else
        print_warning "app/.env.local already exists"
    fi
    
    # Root environment file
    if [ ! -f ./.env ]; then
        cat > ./.env << EOF
# Development Environment Variables

# Network Configuration
NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Deployment Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# NPM Publishing
NPM_TOKEN=your-npm-token

# Discord Notifications
DISCORD_WEBHOOK=your-discord-webhook-url
EOF
        print_status "Created .env file"
    else
        print_warning ".env already exists"
    fi
}

# Install project dependencies
install_project_deps() {
    echo -e "${BLUE}Installing project dependencies...${NC}"
    
    pnpm install
    print_status "Project dependencies installed"
}

# Build project
build_project() {
    echo -e "${BLUE}Building project...${NC}"
    
    # Build SDK
    cd ./packages/sdk
    pnpm build
    cd ../..
    
    # Build app
    cd ./app
    pnpm build
    cd ..
    
    print_status "Project built successfully"
}

# Run initial tests
run_tests() {
    echo -e "${BLUE}Running initial tests...${NC}"
    
    # Run SDK tests
    cd ./tests
    pnpm test:integration || print_warning "Some integration tests failed"
    cd ..
    
    print_status "Initial tests completed"
}

# Setup git hooks
setup_git_hooks() {
    echo -e "${BLUE}Setting up git hooks...${NC}"
    
    if [ -d .git ]; then
        pnpm prepare
        print_status "Git hooks installed"
    else
        print_warning "Not a git repository, skipping git hooks"
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update environment variables in .env and app/.env.local"
    echo "2. Set up your Supabase project and update the database schema:"
    echo "   - Create a new Supabase project"
    echo "   - Run the SQL from infra/supabase/schema.sql"
    echo "   - Update the environment variables"
    echo ""
    echo "3. Start development:"
    echo "   ${BLUE}pnpm dev${NC}     # Start all services"
    echo "   ${BLUE}pnpm build${NC}    # Build all packages"
    echo "   ${BLUE}pnpm test${NC}     # Run all tests"
    echo ""
    echo "4. Deploy to devnet:"
    echo "   ${BLUE}./scripts/deploy.sh --network devnet${NC}"
    echo ""
    echo "5. When ready for production:"
    echo "   ${BLUE}./scripts/deploy.sh --network mainnet${NC}"
    echo ""
    echo -e "${BLUE}Your Solana address: $(solana address)${NC}"
    echo -e "${BLUE}Current balance: $(solana balance) SOL${NC}"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "- Anchor: https://www.anchor-lang.com/"
    echo "- Solana: https://docs.solana.com/"
    echo "- Next.js: https://nextjs.org/docs"
    echo "- Supabase: https://supabase.com/docs"
}

# Main setup function
main() {
    echo -e "${BLUE}Starting environment setup...${NC}"
    echo ""
    
    check_os
    install_node
    install_rust
    install_solana
    install_anchor
    setup_solana_keypairs
    install_dev_tools
    setup_env_files
    install_project_deps
    setup_git_hooks
    build_project
    run_tests
    
    print_next_steps
}

# Run main function
main "$@"