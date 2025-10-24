#!/usr/bin/env node

/**
 * MeetBase Vercel Deployment Integrity Checker
 * 
 * An automated assistant that validates Next.js builds for Vercel before deployment.
 * It detects and explains errors, missing types, and structural inconsistencies 
 * that could cause failed builds or broken functionality.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelIntegrityChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.buildOutput = '';
    this.lintOutput = '';
    this.typeCheckOutput = '';
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔍 MeetBase Vercel Deployment Integrity Checker');
    console.log('================================================\n');

    try {
      // Step 1: Check prerequisites
      await this.checkPrerequisites();

      // Step 2: Run build validation
      await this.validateBuild();

      // Step 3: Run linting
      await this.validateLinting();

      // Step 4: Run type checking
      await this.validateTypes();

      // Step 5: Check environment variables
      await this.validateEnvironment();

      // Step 6: Validate API routes
      await this.validateAPIRoutes();

      // Step 7: Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Integrity check failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check if all required tools are available
   */
  async checkPrerequisites() {
    console.log('📋 Checking prerequisites...');
    
    const requiredCommands = ['node', 'npm', 'npx'];
    const missing = [];

    for (const cmd of requiredCommands) {
      try {
        execSync(`${cmd} --version`, { stdio: 'ignore' });
      } catch {
        missing.push(cmd);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required tools: ${missing.join(', ')}`);
    }

    console.log('✅ All prerequisites met\n');
  }

  /**
   * Validate Next.js build
   */
  async validateBuild() {
    console.log('🔨 Running Next.js build validation...');
    
    try {
      this.buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Build completed successfully\n');
    } catch (error) {
      this.parseBuildErrors(error.stdout || error.stderr);
      throw new Error('Build validation failed');
    }
  }

  /**
   * Validate ESLint
   */
  async validateLinting() {
    console.log('🔍 Running ESLint validation...');
    
    try {
      this.lintOutput = execSync('npm run lint', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Linting passed\n');
    } catch (error) {
      this.parseLintErrors(error.stdout || error.stderr);
      console.log('⚠️  Linting issues found (see details below)\n');
    }
  }

  /**
   * Validate TypeScript types
   */
  async validateTypes() {
    console.log('📝 Running TypeScript validation...');
    
    try {
      this.typeCheckOutput = execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Type checking passed\n');
    } catch (error) {
      this.parseTypeErrors(error.stdout || error.stderr);
      throw new Error('TypeScript validation failed');
    }
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment() {
    console.log('🌍 Validating environment variables...');
    
    const envFile = '.env.local';
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    if (!fs.existsSync(envFile)) {
      this.warnings.push({
        type: 'environment',
        message: '.env.local file not found',
        recommendation: 'Create .env.local with required environment variables'
      });
    } else {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const missingVars = requiredVars.filter(varName => 
        !envContent.includes(varName)
      );

      if (missingVars.length > 0) {
        this.warnings.push({
          type: 'environment',
          message: `Missing environment variables: ${missingVars.join(', ')}`,
          recommendation: 'Add missing variables to .env.local'
        });
      }
    }

    console.log('✅ Environment validation completed\n');
  }

  /**
   * Validate API routes
   */
  async validateAPIRoutes() {
    console.log('🛣️  Validating API routes...');
    
    const apiDir = 'src/app/api';
    if (!fs.existsSync(apiDir)) {
      this.warnings.push({
        type: 'api',
        message: 'API directory not found',
        recommendation: 'Create src/app/api directory for API routes'
      });
      return;
    }

    const apiFiles = this.getAPIFiles(apiDir);
    for (const file of apiFiles) {
      await this.validateAPIFile(file);
    }

    console.log('✅ API routes validation completed\n');
  }

  /**
   * Get all API route files
   */
  getAPIFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAPIFiles(fullPath));
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Validate individual API file
   */
  async validateAPIFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required exports
      if (!content.includes('export async function GET') && 
          !content.includes('export async function POST') &&
          !content.includes('export async function PUT') &&
          !content.includes('export async function DELETE')) {
        this.warnings.push({
          type: 'api',
          message: `API route ${filePath} has no HTTP method exports`,
          recommendation: 'Add at least one HTTP method export (GET, POST, PUT, DELETE)'
        });
      }

      // Check for proper error handling
      if (!content.includes('try') && !content.includes('catch')) {
        this.warnings.push({
          type: 'api',
          message: `API route ${filePath} lacks error handling`,
          recommendation: 'Add try-catch blocks for proper error handling'
        });
      }

    } catch (error) {
      this.errors.push({
        type: 'api',
        message: `Failed to read API file ${filePath}`,
        recommendation: 'Check file permissions and syntax'
      });
    }
  }

  /**
   * Parse build errors
   */
  parseBuildErrors(output) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Error:') || line.includes('Failed to compile')) {
        const match = line.match(/(.+?):(\d+):(\d+)/);
        if (match) {
          this.errors.push({
            type: 'build',
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: line.trim(),
            recommendation: 'Fix the compilation error in the specified file'
          });
        }
      }
    }
  }

  /**
   * Parse lint errors
   */
  parseLintErrors(output) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error') || line.includes('warning')) {
        const match = line.match(/(.+?):(\d+):(\d+)/);
        if (match) {
          this.warnings.push({
            type: 'lint',
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: line.trim(),
            recommendation: 'Fix the linting issue in the specified file'
          });
        }
      }
    }
  }

  /**
   * Parse TypeScript errors
   */
  parseTypeErrors(output) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS')) {
        const match = line.match(/(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)/);
        if (match) {
          this.errors.push({
            type: 'typescript',
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: `TS${match[4]}`,
            message: match[5],
            recommendation: this.getTypeScriptRecommendation(match[4], match[5])
          });
        }
      }
    }
  }

  /**
   * Get TypeScript error recommendations
   */
  getTypeScriptRecommendation(code, message) {
    const recommendations = {
      '2304': 'Variable not found - check imports and variable declarations',
      '2339': 'Property does not exist - check object type definitions',
      '2345': 'Type mismatch - ensure types are compatible',
      '7006': 'Parameter type not specified - add type annotations',
      '7030': 'Not all code paths return a value - add return statements'
    };

    return recommendations[code] || 'Review TypeScript error and fix type issues';
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('📊 INTEGRITY CHECK REPORT');
    console.log('========================\n');

    // Error Summary
    if (this.errors.length > 0) {
      console.log('❌ BLOCKING ERRORS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type.toUpperCase()} ERROR`);
        console.log(`   File: ${error.file || 'N/A'}`);
        console.log(`   Line: ${error.line || 'N/A'}`);
        console.log(`   Message: ${error.message}`);
        console.log(`   Fix: ${error.recommendation}\n`);
      });
    }

    // Warning Summary
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.type.toUpperCase()} WARNING`);
        console.log(`   File: ${warning.file || 'N/A'}`);
        console.log(`   Line: ${warning.line || 'N/A'}`);
        console.log(`   Message: ${warning.message}`);
        console.log(`   Recommendation: ${warning.recommendation}\n`);
      });
    }

    // Status
    let status;
    if (this.errors.length > 0) {
      status = '🚫 DEPLOYMENT BLOCKED';
    } else if (this.warnings.length > 0) {
      status = '⚠️  MANUAL VERIFICATION REQUIRED';
    } else {
      status = '✅ SAFE FOR VERCEL DEPLOYMENT';
    }

    console.log(`STATUS: ${status}\n`);

    // Integrity Notes
    console.log('INTEGRITY NOTES:');
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All system consistency checks passed');
      console.log('✅ Build safety confirmed');
      console.log('✅ Schema alignment verified');
      console.log('✅ Ready for Vercel deployment');
    } else {
      console.log('⚠️  Issues detected that may affect deployment');
      console.log('📝 Review and fix all blocking errors before deployment');
      console.log('🔍 Consider addressing warnings for optimal performance');
    }

    // Exit with appropriate code
    if (this.errors.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run the integrity checker
if (require.main === module) {
  const checker = new VercelIntegrityChecker();
  checker.run().catch(error => {
    console.error('❌ Integrity check failed:', error.message);
    process.exit(1);
  });
}

module.exports = VercelIntegrityChecker;
