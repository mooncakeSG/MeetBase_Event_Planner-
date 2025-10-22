# MeetBase Fly.io Deployment Script (PowerShell)
# This script automates the deployment process to Fly.io

param(
    [switch]$SkipChecks,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host "MeetBase Fly.io Deployment Script" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\deploy-fly.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipChecks    Skip pre-deployment checks"
    Write-Host "  -Help          Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy-fly.ps1                 # Full deployment with checks"
    Write-Host "  .\deploy-fly.ps1 -SkipChecks     # Deploy without checks"
    exit 0
}

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if fly CLI is installed
function Test-FlyCLI {
    Write-Status "Checking Fly CLI installation..."
    try {
        $null = fly --version
        Write-Success "Fly CLI is installed"
        return $true
    }
    catch {
        Write-Error "Fly CLI is not installed. Please install it first:"
        Write-Host "  curl -L https://fly.io/install.sh | sh" -ForegroundColor Cyan
        return $false
    }
}

# Check if user is logged in
function Test-FlyAuth {
    Write-Status "Checking Fly.io authentication..."
    try {
        $null = fly auth whoami
        Write-Success "Authenticated with Fly.io"
        return $true
    }
    catch {
        Write-Warning "Not logged in to Fly.io. Please login:"
        Write-Host "  fly auth login" -ForegroundColor Cyan
        return $false
    }
}

# Check if Docker is running
function Test-Docker {
    Write-Status "Checking Docker..."
    try {
        $null = docker info
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        return $false
    }
}

# Check environment variables
function Test-Environment {
    Write-Status "Checking environment variables..."
    
    if (-not (Test-Path ".env.local")) {
        Write-Warning ".env.local not found. Creating from template..."
        if (Test-Path "env.local.example_frontend") {
            Copy-Item "env.local.example_frontend" ".env.local"
            Write-Warning "Please update .env.local with your actual values before deploying"
        }
        else {
            Write-Error "No environment template found. Please create .env.local manually"
            return $false
        }
    }
    
    Write-Success "Environment file found"
    return $true
}

# Initialize Fly.io app if not already done
function Initialize-FlyApp {
    Write-Status "Initializing Fly.io app..."
    
    if (-not (Test-Path "fly.toml")) {
        Write-Status "No fly.toml found. Initializing Fly.io app..."
        fly launch --no-deploy --name meetbase
        Write-Success "Fly.io app initialized"
    }
    else {
        Write-Success "Fly.io app already configured"
    }
}

# Set environment secrets
function Set-Secrets {
    Write-Status "Setting environment secrets..."
    
    # Check if secrets are already set
    $secrets = fly secrets list
    if ($secrets -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Warning "Secrets already set. Skipping..."
        return $true
    }
    
    Write-Warning "Please set your environment secrets manually:"
    Write-Host ""
    Write-Host "fly secrets set NEXT_PUBLIC_SUPABASE_URL=`"https://your-project.supabase.co`"" -ForegroundColor Cyan
    Write-Host "fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=`"your-anon-key`"" -ForegroundColor Cyan
    Write-Host "fly secrets set SUPABASE_SERVICE_ROLE_KEY=`"your-service-role-key`"" -ForegroundColor Cyan
    Write-Host "fly secrets set EMAIL_HOST=`"smtp.gmail.com`"" -ForegroundColor Cyan
    Write-Host "fly secrets set EMAIL_PORT=`"587`"" -ForegroundColor Cyan
    Write-Host "fly secrets set EMAIL_USER=`"your-email@gmail.com`"" -ForegroundColor Cyan
    Write-Host "fly secrets set EMAIL_PASS=`"your-app-password`"" -ForegroundColor Cyan
    Write-Host "fly secrets set EMAIL_FROM=`"MeetBase <noreply@meetbase.com>`"" -ForegroundColor Cyan
    Write-Host "fly secrets set OPENAI_API_KEY=`"your-groq-api-key`"" -ForegroundColor Cyan
    Write-Host "fly secrets set AI_ASSISTANT_ENABLED=`"true`"" -ForegroundColor Cyan
    Write-Host "fly secrets set NEXTAUTH_SECRET=`"your-secret-key`"" -ForegroundColor Cyan
    Write-Host "fly secrets set NEXTAUTH_URL=`"https://meetbase.fly.dev`"" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "Have you set all the required secrets? (y/n)"
    if ($response -notmatch "^[Yy]$") {
        Write-Error "Please set the secrets first, then run this script again"
        return $false
    }
    
    return $true
}

# Build and deploy
function Deploy-App {
    Write-Status "Building and deploying to Fly.io..."
    
    # Deploy the application
    fly deploy
    
    Write-Success "Deployment completed!"
}

# Post-deployment checks
function Test-PostDeployment {
    Write-Status "Running post-deployment checks..."
    
    # Get the app URL
    $appInfo = fly info
    $appUrl = ($appInfo | Select-String "Hostname").Line.Split()[1]
    
    if (-not $appUrl) {
        Write-Error "Could not determine app URL"
        return $false
    }
    
    Write-Success "App deployed at: https://$appUrl"
    
    # Test health endpoint
    Write-Status "Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "https://$appUrl/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed"
        }
        else {
            Write-Warning "Health check failed - app may still be starting up"
        }
    }
    catch {
        Write-Warning "Health check failed - app may still be starting up"
    }
    
    # Open the app
    Write-Status "Opening app in browser..."
    fly open
    
    return $true
}

# Main deployment function
function Start-Deployment {
    Write-Host ""
    Write-Status "Starting MeetBase deployment to Fly.io..."
    Write-Host ""
    
    if (-not $SkipChecks) {
        # Run all checks
        if (-not (Test-FlyCLI)) { exit 1 }
        if (-not (Test-FlyAuth)) { exit 1 }
        if (-not (Test-Docker)) { exit 1 }
        if (-not (Test-Environment)) { exit 1 }
        Initialize-FlyApp
        if (-not (Set-Secrets)) { exit 1 }
        
        Write-Host ""
        Write-Status "All checks passed. Proceeding with deployment..."
        Write-Host ""
    }
    
    # Deploy
    Deploy-App
    
    Write-Host ""
    Write-Success "Deployment completed successfully!"
    Write-Host ""
    
    # Post-deployment
    Test-PostDeployment
    
    Write-Host ""
    Write-Success "🎉 MeetBase is now live on Fly.io!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  1. Test all features in the deployed app"
    Write-Host "  2. Set up custom domain (optional)"
    Write-Host "  3. Configure monitoring and alerts"
    Write-Host "  4. Set up CI/CD for automatic deployments"
    Write-Host ""
}

# Run main function
Start-Deployment
