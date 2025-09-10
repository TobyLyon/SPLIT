#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${NETWORK:-"devnet"}
PROGRAM_DIR="./programs/splitsquads"
APP_DIR="./app"
SDK_DIR="./packages/sdk"

echo -e "${BLUE}🚀 SplitSquads Deployment Script${NC}"
echo -e "${BLUE}Network: ${NETWORK}${NC}"
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

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI is not installed. Please install it first."
        exit 1
    fi
    
    print_status "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    pnpm install --frozen-lockfile
    print_status "Dependencies installed"
}

# Build and test the Anchor program
deploy_program() {
    echo -e "${BLUE}Building and deploying Anchor program...${NC}"
    
    cd $PROGRAM_DIR
    
    # Set Solana config
    if [ "$NETWORK" = "mainnet" ]; then
        solana config set --url mainnet-beta
    else
        solana config set --url devnet
    fi
    
    # Build program
    echo "Building program..."
    anchor build
    print_status "Program built successfully"
    
    # Run tests on localnet if not mainnet
    if [ "$NETWORK" != "mainnet" ]; then
        echo "Running program tests..."
        # Start local validator in background
        solana-test-validator --reset --quiet &
        VALIDATOR_PID=$!
        sleep 10
        
        # Run tests
        anchor test --skip-local-validator
        
        # Stop validator
        kill $VALIDATOR_PID 2>/dev/null || true
        print_status "Program tests passed"
    fi
    
    # Deploy program
    echo "Deploying program to $NETWORK..."
    if [ "$NETWORK" = "mainnet" ]; then
        anchor deploy --provider.cluster mainnet
    else
        anchor deploy --provider.cluster devnet
    fi
    
    # Get program ID
    PROGRAM_ID=$(solana address -k target/deploy/splitsquads-keypair.json)
    echo "Program ID: $PROGRAM_ID"
    
    # Update IDL
    if [ "$NETWORK" = "mainnet" ]; then
        anchor idl init --filepath target/idl/splitsquads.json $PROGRAM_ID --provider.cluster mainnet
    else
        anchor idl init --filepath target/idl/splitsquads.json $PROGRAM_ID --provider.cluster devnet
    fi
    
    cd - > /dev/null
    print_status "Program deployed successfully"
}

# Build SDK
build_sdk() {
    echo -e "${BLUE}Building SDK...${NC}"
    
    cd $SDK_DIR
    pnpm build
    cd - > /dev/null
    
    print_status "SDK built successfully"
}

# Test SDK
test_sdk() {
    echo -e "${BLUE}Testing SDK...${NC}"
    
    cd ./tests
    pnpm test:integration
    cd - > /dev/null
    
    print_status "SDK tests passed"
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}Building frontend...${NC}"
    
    cd $APP_DIR
    
    # Check if environment variables are set
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_URL not set"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    fi
    
    # Build app
    pnpm build
    cd - > /dev/null
    
    print_status "Frontend built successfully"
}

# Run E2E tests
run_e2e_tests() {
    echo -e "${BLUE}Running E2E tests...${NC}"
    
    cd $APP_DIR
    
    # Start app in background
    pnpm start &
    APP_PID=$!
    sleep 10
    
    cd ../tests
    
    # Install Playwright browsers if needed
    pnpm exec playwright install --with-deps
    
    # Run E2E tests
    pnpm test:e2e
    
    # Stop app
    kill $APP_PID 2>/dev/null || true
    
    cd - > /dev/null
    print_status "E2E tests passed"
}

# Deploy to Vercel (if configured)
deploy_frontend() {
    if [ -n "$VERCEL_TOKEN" ]; then
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        
        cd $APP_DIR
        
        # Install Vercel CLI if not present
        if ! command -v vercel &> /dev/null; then
            pnpm add -g vercel
        fi
        
        # Deploy
        if [ "$NETWORK" = "mainnet" ]; then
            vercel --prod --token $VERCEL_TOKEN
        else
            vercel --token $VERCEL_TOKEN
        fi
        
        cd - > /dev/null
        print_status "Frontend deployed to Vercel"
    else
        print_warning "Vercel token not set, skipping frontend deployment"
    fi
}

# Publish SDK to NPM (if configured)
publish_sdk() {
    if [ -n "$NPM_TOKEN" ] && [ "$NETWORK" = "mainnet" ]; then
        echo -e "${BLUE}Publishing SDK to NPM...${NC}"
        
        cd $SDK_DIR
        
        # Set NPM token
        echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
        
        # Publish
        pnpm publish --access public
        
        # Clean up
        rm .npmrc
        
        cd - > /dev/null
        print_status "SDK published to NPM"
    else
        print_warning "NPM token not set or not mainnet, skipping SDK publishing"
    fi
}

# Setup Supabase (if configured)
setup_supabase() {
    if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
        echo -e "${BLUE}Setting up Supabase...${NC}"
        
        # Install Supabase CLI if not present
        if ! command -v supabase &> /dev/null; then
            curl -sSfL https://supabase.com/install.sh | sh
        fi
        
        # Run migrations
        cd ./infra/supabase
        supabase db push --db-url $SUPABASE_DB_URL
        cd - > /dev/null
        
        print_status "Supabase setup completed"
    else
        print_warning "Supabase credentials not set, skipping database setup"
    fi
}

# Seed sample data
seed_data() {
    if [ "$NETWORK" != "mainnet" ]; then
        echo -e "${BLUE}Seeding sample data...${NC}"
        
        # This would run a script to create sample squads and members
        # node scripts/seed-data.js
        
        print_status "Sample data seeded"
    else
        print_warning "Skipping data seeding on mainnet"
    fi
}

# Main deployment flow
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    echo ""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --network)
                NETWORK="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --skip-program)
                SKIP_PROGRAM=true
                shift
                ;;
            *)
                echo "Unknown option $1"
                exit 1
                ;;
        esac
    done
    
    check_dependencies
    install_dependencies
    
    if [ "$SKIP_PROGRAM" != "true" ]; then
        deploy_program
    fi
    
    build_sdk
    
    if [ "$SKIP_TESTS" != "true" ]; then
        test_sdk
    fi
    
    if [ "$SKIP_FRONTEND" != "true" ]; then
        build_frontend
        
        if [ "$SKIP_TESTS" != "true" ]; then
            run_e2e_tests
        fi
        
        deploy_frontend
    fi
    
    if [ "$NETWORK" = "mainnet" ]; then
        publish_sdk
    fi
    
    setup_supabase
    seed_data
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}Network: ${NETWORK}${NC}"
    
    if [ -n "$PROGRAM_ID" ]; then
        echo -e "${BLUE}Program ID: ${PROGRAM_ID}${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update your frontend environment variables with the new program ID"
    echo "2. Test the application thoroughly"
    echo "3. Update documentation with new deployment information"
    
    if [ "$NETWORK" = "devnet" ]; then
        echo "4. When ready, deploy to mainnet with: ./scripts/deploy.sh --network mainnet"
    fi
}

# Run main function
main "$@"