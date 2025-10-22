# MeetBase Setup Script
# This script helps you set up MeetBase for development or deployment

param(
    [switch]$Development,
    [switch]$FlyDeploy,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host "MeetBase Setup Script" -ForegroundColor Blue
    Write-Host "====================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\setup-meetbase.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Development    Set up for local development"
    Write-Host "  -FlyDeploy      Set up for Fly.io deployment"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup-meetbase.ps1 -Development     # Development setup"
    Write-Host "  .\setup-meetbase.ps1 -FlyDeploy        # Fly.io deployment setup"
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

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js installed: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm installed: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed. Please install npm"
        return $false
    }
    
    return $true
}

# Development setup
function Setup-Development {
    Write-Status "Setting up MeetBase for development..."
    
    # Install dependencies
    Write-Status "Installing frontend dependencies..."
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies"
        return $false
    }
    
    # Set up environment files
    Write-Status "Setting up environment files..."
    
    if (-not (Test-Path ".env.local")) {
        if (Test-Path "env.local.example_frontend") {
            Copy-Item "env.local.example_frontend" ".env.local"
            Write-Warning "Created .env.local from template. Please update with your values."
        }
        else {
            Write-Error "No environment template found. Please create .env.local manually"
            return $false
        }
    }
    
    # Check Python for backend
    try {
        $pythonVersion = python --version
        Write-Success "Python installed: $pythonVersion"
        
        # Install Python dependencies
        Write-Status "Installing Python dependencies..."
        Set-Location "backend"
        pip install -r requirements.txt
        Set-Location ".."
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install Python dependencies"
            return $false
        }
    }
    catch {
        Write-Warning "Python not found. Backend features will not be available."
    }
    
    Write-Success "Development setup completed!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  1. Update .env.local with your Supabase credentials"
    Write-Host "  2. Run 'npm run dev' to start the development server"
    Write-Host "  3. Open http://localhost:3000 in your browser"
    Write-Host ""
    
    return $true
}

# Fly.io deployment setup
function Setup-FlyDeploy {
    Write-Status "Setting up MeetBase for Fly.io deployment..."
    
    # Check Fly CLI
    try {
        $flyVersion = fly --version
        Write-Success "Fly CLI installed: $flyVersion"
    }
    catch {
        Write-Error "Fly CLI is not installed. Please install it first:"
        Write-Host "  curl -L https://fly.io/install.sh | sh" -ForegroundColor Cyan
        return $false
    }
    
    # Check Docker
    try {
        $null = docker info
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        return $false
    }
    
    # Initialize Fly.io app
    if (-not (Test-Path "fly.toml")) {
        Write-Status "Initializing Fly.io app..."
        fly launch --no-deploy --name meetbase
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to initialize Fly.io app"
            return $false
        }
    }
    else {
        Write-Success "Fly.io app already configured"
    }
    
    Write-Success "Fly.io setup completed!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  1. Set your environment secrets with 'fly secrets set'"
    Write-Host "  2. Run 'fly deploy' to deploy your app"
    Write-Host "  3. Or use the automated script: .\deploy-fly.ps1"
    Write-Host ""
    Write-Host "Required secrets:"
    Write-Host "  fly secrets set NEXT_PUBLIC_SUPABASE_URL=\"https://your-project.supabase.co\""
    Write-Host "  fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=\"your-anon-key\""
    Write-Host "  fly secrets set SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key\""
    Write-Host "  # ... (see FLY-QUICKSTART.md for full list)"
    Write-Host ""
    
    return $true
}

# Main function
function Start-Setup {
    Write-Host ""
    Write-Status "MeetBase Setup Script"
    Write-Host "====================="
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Run appropriate setup
    if ($Development) {
        Setup-Development
    }
    elseif ($FlyDeploy) {
        Setup-FlyDeploy
    }
    else {
        Write-Host "Please specify setup type:" -ForegroundColor Yellow
        Write-Host "  .\setup-meetbase.ps1 -Development    # For local development"
        Write-Host "  .\setup-meetbase.ps1 -FlyDeploy       # For Fly.io deployment"
        Write-Host "  .\setup-meetbase.ps1 -Help            # Show help"
    }
}

# Run main function
Start-Setup
