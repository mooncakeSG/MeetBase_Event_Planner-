#!/bin/bash

# MeetBase Fly.io Deployment Script (No Docker Required)
# This script deploys to Fly.io using buildpacks instead of Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if fly CLI is installed
check_fly_cli() {
    print_status "Checking Fly CLI installation..."
    if command -v fly &> /dev/null; then
        print_success "Fly CLI is installed"
        return 0
    else
        print_error "Fly CLI is not installed. Please install it first:"
        echo "  curl -L https://fly.io/install.sh | sh"
        return 1
    fi
}

# Check if user is logged in
check_fly_auth() {
    print_status "Checking Fly.io authentication..."
    if fly auth whoami &> /dev/null; then
        print_success "Authenticated with Fly.io"
        return 0
    else
        print_warning "Not logged in to Fly.io. Please login:"
        echo "  fly auth login"
        return 1
    fi
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        return 0
    else
        print_error "Node.js is not installed. Please install Node.js first:"
        echo "  https://nodejs.org/"
        return 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
        return 0
    else
        print_error "npm is not installed. Please install npm first."
        return 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Build the application
build_app() {
    print_status "Building the application..."
    if npm run build; then
        print_success "Application built successfully"
        return 0
    else
        print_error "Failed to build application"
        return 1
    fi
}

# Initialize Fly.io app if not already done
initialize_fly_app() {
    print_status "Initializing Fly.io app..."
    
    if [ ! -f "fly.toml" ]; then
        print_status "No fly.toml found. Initializing Fly.io app..."
        fly launch --no-deploy --name meetbase
        print_success "Fly.io app initialized"
    else
        print_success "Fly.io app already configured"
    fi
}

# Set environment secrets
set_secrets() {
    print_status "Setting environment secrets..."
    
    # Check if secrets are already set
    if fly secrets list | grep -q "NEXT_PUBLIC_SUPABASE_URL"; then
        print_warning "Secrets already set. Skipping..."
        return 0
    fi
    
    print_warning "Please set your environment secrets manually:"
    echo ""
    echo "fly secrets set NEXT_PUBLIC_SUPABASE_URL=\"https://your-project.supabase.co\""
    echo "fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=\"your-anon-key\""
    echo "fly secrets set SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key\""
    echo "fly secrets set EMAIL_HOST=\"smtp.gmail.com\""
    echo "fly secrets set EMAIL_PORT=\"587\""
    echo "fly secrets set EMAIL_USER=\"your-email@gmail.com\""
    echo "fly secrets set EMAIL_PASS=\"your-app-password\""
    echo "fly secrets set EMAIL_FROM=\"MeetBase <noreply@meetbase.com>\""
    echo "fly secrets set OPENAI_API_KEY=\"your-groq-api-key\""
    echo "fly secrets set AI_ASSISTANT_ENABLED=\"true\""
    echo "fly secrets set NEXTAUTH_SECRET=\"your-secret-key\""
    echo "fly secrets set NEXTAUTH_URL=\"https://meetbase.fly.dev\""
    echo ""
    
    read -p "Have you set all the required secrets? (y/n): " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Please set the secrets first, then run this script again"
        return 1
    fi
    
    return 0
}

# Deploy using buildpacks
deploy_app() {
    print_status "Deploying to Fly.io using buildpacks..."
    
    # Deploy the application
    fly deploy --buildpack-only
    
    print_success "Deployment completed!"
}

# Post-deployment checks
test_post_deployment() {
    print_status "Running post-deployment checks..."
    
    # Get the app URL
    APP_URL=$(fly info | grep "Hostname" | awk '{print $2}')
    
    if [ -z "$APP_URL" ]; then
        print_error "Could not determine app URL"
        return 1
    fi
    
    print_success "App deployed at: https://$APP_URL"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f -s "https://$APP_URL/api/health" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - app may still be starting up"
    fi
    
    # Open the app
    print_status "Opening app in browser..."
    fly open
    
    return 0
}

# Main deployment function
main() {
    echo ""
    print_status "Starting MeetBase deployment to Fly.io (No Docker Required)..."
    echo ""
    
    # Run all checks
    check_fly_cli || exit 1
    check_fly_auth || exit 1
    check_nodejs || exit 1
    check_npm || exit 1
    install_dependencies || exit 1
    build_app || exit 1
    initialize_fly_app
    set_secrets || exit 1
    
    echo ""
    print_status "All checks passed. Proceeding with deployment..."
    echo ""
    
    # Deploy
    deploy_app
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    
    # Post-deployment
    test_post_deployment
    
    echo ""
    print_success "🎉 MeetBase is now live on Fly.io (No Docker Required)!"
    echo ""
    print_status "Next steps:"
    echo "  1. Test all features in the deployed app"
    echo "  2. Set up custom domain (optional)"
    echo "  3. Configure monitoring and alerts"
    echo "  4. Set up CI/CD for automatic deployments"
    echo ""
}

# Run main function
main
