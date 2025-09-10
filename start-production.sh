#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${CYAN}"
cat << "EOF"
   _____ ____  __    _ __  _____                      __    
  / ___// __ \/ /   (_) /_/ ___/____ ___  ______ ____/ /____
  \__ \/ /_/ / /   / / __/\__ \/ __ \/ / / / __ \/ __  / __ \
 ___/ / ____/ /___/ / /_ ___/ / /_/ / /_/ / /_/ / /_/ / /_/ /
/____/_/   /_____/_/\__//____/\__, /\__,_/\__,_/\__,_/\____/ 
                             /____/                          
EOF
echo -e "${NC}"

echo -e "${BLUE}🚀 SplitSquads Production Deployment${NC}"
echo -e "${PURPLE}Rewards-sharing social staking on Solana${NC}"
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

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check if environment file exists
    if [ ! -f "./app/.env.local" ]; then
        print_error "Environment file not found!"
        echo -e "${YELLOW}Please copy and configure your environment file:${NC}"
        echo "cp app/.env.local.example app/.env.local"
        echo "# Then edit app/.env.local with your configuration"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        pnpm install
    fi
    
    print_status "Prerequisites checked"
}

# Build the application
build_application() {
    echo -e "${BLUE}Building application...${NC}"
    
    # Build SDK first
    cd packages/sdk
    pnpm build
    cd ../..
    
    # Build frontend
    cd app
    pnpm build
    cd ..
    
    print_status "Application built successfully"
}

# Start production server
start_server() {
    echo -e "${BLUE}Starting production server...${NC}"
    
    cd app
    
    # Check if build exists
    if [ ! -d ".next" ]; then
        print_error "Build not found! Please run build first."
        exit 1
    fi
    
    # Start the server
    echo -e "${GREEN}🌐 Starting SplitSquads on http://localhost:3000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    
    pnpm start
}

# Deploy to Vercel
deploy_to_vercel() {
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        pnpm add -g vercel
    fi
    
    cd app
    
    # Deploy to production
    echo -e "${YELLOW}Deploying to production...${NC}"
    vercel --prod
    
    cd ..
    print_status "Deployed to Vercel successfully"
}

# Setup Supabase
setup_supabase() {
    echo -e "${BLUE}Setting up Supabase...${NC}"
    
    if [ -z "$SUPABASE_URL" ]; then
        print_warning "Supabase URL not configured. Please set up your database manually."
        echo "1. Create a Supabase project at https://supabase.com"
        echo "2. Run the SQL from infra/supabase/schema.sql"
        echo "3. Update your environment variables"
        return
    fi
    
    print_info "Supabase configuration detected"
    print_status "Supabase setup complete"
}

# Show deployment information
show_deployment_info() {
    echo ""
    echo -e "${GREEN}🎉 SplitSquads is ready for production!${NC}"
    echo ""
    echo -e "${CYAN}📱 Access your app:${NC}"
    echo "   Local:  http://localhost:3000"
    echo "   Mobile: Use your computer's IP address"
    echo ""
    echo -e "${CYAN}🔗 Important URLs:${NC}"
    echo "   Dashboard:    /dashboard"
    echo "   Squads:       /squads" 
    echo "   Leaderboard:  /leaderboard"
    echo "   API Docs:     /api"
    echo ""
    echo -e "${CYAN}🛠 Next steps:${NC}"
    echo "   1. Test wallet connection with Phantom/Solflare"
    echo "   2. Create your first squad"
    echo "   3. Invite friends to join"
    echo "   4. Start staking and earning rewards!"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   • Use devnet for testing, mainnet for production"
    echo "   • Monitor transactions on Solana Explorer"
    echo "   • Join our Discord for support and updates"
    echo ""
    echo -e "${PURPLE}Built with ❤️ on Solana${NC}"
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            check_prerequisites
            build_application
            start_server
            ;;
        "build")
            check_prerequisites
            build_application
            show_deployment_info
            ;;
        "deploy")
            check_prerequisites
            build_application
            deploy_to_vercel
            show_deployment_info
            ;;
        "setup")
            check_prerequisites
            setup_supabase
            print_status "Setup complete! Run './start-production.sh build' to build the app."
            ;;
        *)
            echo "Usage: $0 {start|build|deploy|setup}"
            echo ""
            echo "Commands:"
            echo "  start   - Build and start production server locally"
            echo "  build   - Build application for production"
            echo "  deploy  - Deploy to Vercel"
            echo "  setup   - Setup prerequisites and database"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"