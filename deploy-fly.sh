#!/bin/bash

# MeetBase Fly.io Deployment Script
# This script automates the deployment process to Fly.io

set -e  # Exit on any error

echo "🚀 MeetBase Fly.io Deployment Script"
echo "=================================="

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
    if ! command -v fly &> /dev/null; then
        print_error "Fly CLI is not installed. Please install it first:"
        echo "  curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    print_success "Fly CLI is installed"
}

# Check if user is logged in
check_fly_auth() {
    print_status "Checking Fly.io authentication..."
    if ! fly auth whoami &> /dev/null; then
        print_warning "Not logged in to Fly.io. Please login:"
        echo "  fly auth login"
        exit 1
    fi
    print_success "Authenticated with Fly.io"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from template..."
        if [ -f "env.local.example_frontend" ]; then
            cp env.local.example_frontend .env.local
            print_warning "Please update .env.local with your actual values before deploying"
        else
            print_error "No environment template found. Please create .env.local manually"
            exit 1
        fi
    fi
    
    print_success "Environment file found"
}

# Initialize Fly.io app if not already done
init_fly_app() {
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
        return
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
    
    read -p "Have you set all the required secrets? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please set the secrets first, then run this script again"
        exit 1
    fi
}

# Build and deploy
deploy_app() {
    print_status "Building and deploying to Fly.io..."
    
    # Deploy the application
    fly deploy
    
    print_success "Deployment completed!"
}

# Post-deployment checks
post_deployment_checks() {
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
}

# Main deployment function
main() {
    echo ""
    print_status "Starting MeetBase deployment to Fly.io..."
    echo ""
    
    # Run all checks
    check_fly_cli
    check_fly_auth
    check_docker
    check_env_vars
    init_fly_app
    set_secrets
    
    echo ""
    print_status "All checks passed. Proceeding with deployment..."
    echo ""
    
    # Deploy
    deploy_app
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    
    # Post-deployment
    post_deployment_checks
    
    echo ""
    print_success "🎉 MeetBase is now live on Fly.io!"
    echo ""
    print_status "Next steps:"
    echo "  1. Test all features in the deployed app"
    echo "  2. Set up custom domain (optional)"
    echo "  3. Configure monitoring and alerts"
    echo "  4. Set up CI/CD for automatic deployments"
    echo ""
}

# Run main function
main "$@"
