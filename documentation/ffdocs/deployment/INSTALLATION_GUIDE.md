# FlowForge Installation Guide

## Overview

FlowForge is an AI-Powered Developer Productivity Framework available as an NPX package on GitHub Package Registry. This guide provides comprehensive installation instructions for different scenarios and user needs.

**Package Information:**
- **Name**: `@justcode-cruzalex/flowforge`
- **Version**: 2.0.3
- **Registry**: GitHub Package Registry
- **Access**: Public (no authentication required for installation)
- **Commands**: `flowforge` and `ff` (alias)

## Prerequisites

### System Requirements

- **Node.js**: Version 14.0.0 or higher
- **npm**: Version 6.0.0 or higher
- **Operating System**: macOS or Linux
- **Git**: Required for FlowForge functionality
- **Terminal**: Bash-compatible shell

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v14.0.0 or higher

# Check npm version
npm --version
# Should output: 6.0.0 or higher

# Check Git installation
git --version
# Should output: git version x.x.x

# Check operating system (Linux/macOS only)
uname -s
# Should output: Linux or Darwin
```

### GitHub Account Setup

While FlowForge installation doesn't require authentication, you'll need a GitHub account for full functionality:

1. **GitHub Account**: Sign up at [github.com](https://github.com) if you don't have one
2. **Git Configuration**: Set up your Git identity:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### Personal Access Token (Optional for Advanced Features)

For features that interact with GitHub repositories, you'll need a Personal Access Token:

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Set expiration and select scopes:
   - `repo` (for repository access)
   - `workflow` (for GitHub Actions)
   - `read:org` (for organization access, if needed)
4. Generate and copy the token
5. Set as environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_personal_access_token
   # Add to your shell profile (.bashrc, .zshrc) for persistence
   echo 'export GITHUB_TOKEN=your_github_personal_access_token' >> ~/.bashrc
   ```

## Installation Methods

### Method 1: NPX Direct Execution (Recommended)

This is the fastest way to get started with FlowForge without any installation:

```bash
# Execute FlowForge directly
npx @justcode-cruzalex/flowforge

# Use the short alias
npx @justcode-cruzalex/flowforge ff

# Run with specific command
npx @justcode-cruzalex/flowforge flowforge help
```

**Advantages:**
- No local installation required
- Always uses latest version
- Zero setup time
- Perfect for trying FlowForge

**Disadvantages:**
- Slight delay on first run
- Requires internet connection
- May download package each time

### Method 2: Global Installation

Install FlowForge globally for system-wide access:

```bash
# Install globally
npm install -g @justcode-cruzalex/flowforge

# Verify installation
flowforge --version
# Should output: 2.0.3

# Test with alias
ff --version
# Should output: 2.0.3

# Get help
flowforge help
```

**Advantages:**
- Fast execution (no download delay)
- Works offline after installation
- Available from any directory
- Convenient for regular use

**Disadvantages:**
- Requires manual updates
- May conflict with other global packages
- Needs sufficient npm permissions

#### Global Installation Troubleshooting

If you encounter permission errors:

```bash
# Option 1: Use npm prefix (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then install globally
npm install -g @justcode-cruzalex/flowforge

# Option 2: Use sudo (not recommended)
sudo npm install -g @justcode-cruzalex/flowforge
```

### Method 3: Project-Specific Installation

Install FlowForge as a development dependency in your project:

```bash
# Navigate to your project
cd /path/to/your/project

# Install as dev dependency
npm install @justcode-cruzalex/flowforge --save-dev

# Run via npx (from project root)
npx flowforge help

# Or add to package.json scripts
```

Add to your `package.json`:

```json
{
  "scripts": {
    "flowforge": "flowforge",
    "ff": "flowforge"
  }
}
```

Then run:
```bash
npm run flowforge help
npm run ff help
```

**Advantages:**
- Version locked to project
- Isolated from global environment
- Team consistency
- Version control friendly

**Disadvantages:**
- Must run from project root
- Requires project setup
- Larger node_modules

## NPM Configuration (For Publishers Only)

If you plan to publish packages to GitHub Package Registry, set up authentication:

### One-Time NPM Configuration

Create or edit `~/.npmrc`:

```bash
# Create npmrc with GitHub Package Registry configuration
cat >> ~/.npmrc << 'EOF'
@justcode-cruzalex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
//npm.pkg.github.com/:always-auth=false
EOF
```

### Project-Specific Configuration

For project-specific publishing, create `.npmrc` in your project root:

```ini
@justcode-cruzalex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
//npm.pkg.github.com/:always-auth=false
```

**Note**: Regular users don't need this configuration for installation.

## Initialization Process

### First-Time Setup

After installation, initialize FlowForge in your project:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize FlowForge (creates .flowforge directory and config)
flowforge init

# Or using the alias
ff init
```

The initialization process will:
1. Create `.flowforge/` directory structure
2. Set up configuration files
3. Install Git hooks
4. Create project templates
5. Configure time tracking
6. Set up rule enforcement

### Configuration Verification

```bash
# Check FlowForge status
flowforge status

# Verify configuration
flowforge config show

# Test basic functionality
flowforge help

# Verify agent availability
flowforge agent list
```

## First Steps After Installation

### 1. Project Setup

```bash
# Start a new FlowForge session
flowforge session:start

# Create your first GitHub issue (if GitHub integration is set up)
flowforge project:issue create "Setup FlowForge workflow"

# Begin tracking time for the issue
flowforge session:start [issue-number]
```

### 2. Explore Available Commands

```bash
# See all available commands
flowforge help

# Get help for specific command categories
flowforge help session
flowforge help project
flowforge help dev

# List all FlowForge agents
flowforge agent list
```

### 3. Basic Workflow Example

```bash
# Start working on an issue
flowforge session:start 123

# Check development rules compliance
flowforge dev:checkrules

# Run tests (if project has tests)
flowforge dev:tdd feature-name

# End your session
flowforge session:end "Completed initial setup"
```

## Verification Steps

### Installation Verification

```bash
# 1. Verify FlowForge is installed and accessible
flowforge --version
# Expected: 2.0.3

# 2. Check if alias works
ff --version
# Expected: 2.0.3

# 3. Verify help system
flowforge help
# Expected: Command help output

# 4. Check agent availability
flowforge agent list
# Expected: List of available agents
```

### Functionality Verification

```bash
# 1. Test session management
flowforge session:status
# Expected: Current session status

# 2. Test rule checking
flowforge dev:checkrules
# Expected: Rule compliance report

# 3. Test project commands
flowforge project:status
# Expected: Project status information

# 4. Test configuration
flowforge config show
# Expected: Current configuration display
```

### Integration Verification

```bash
# 1. Check Git integration
git status
# Should show FlowForge hooks installed

# 2. Check file structure
ls -la .flowforge/
# Should show FlowForge directory structure

# 3. Verify templates
flowforge template list
# Should show available templates
```

## Troubleshooting Guide

### Quick Reference

**Common Issues Quick Fix:**
- **NPX not found**: Install Node.js 14+
- **Permission denied**: Use `npx` instead of global install
- **GitHub auth fail**: Set `GITHUB_TOKEN` environment variable
- **Command not found**: Check PATH or use `npx @justcode-cruzalex/flowforge`
- **Network issues**: Configure proxy or use offline mode
- **Version conflicts**: Uninstall all versions, reinstall latest

---

### 1. NPX Command Not Found Errors

#### Problem: `npx: command not found`
```bash
# Error message:
bash: npx: command not found
```

**Cause**: NPX is not installed or Node.js version is too old.

**Solutions:**

```bash
# Check Node.js and npm versions
node --version  # Should be 14.0.0+
npm --version   # Should be 6.0.0+

# Solution 1: Update Node.js (includes npm and npx)
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Solution 2: Install npx separately (if using old npm)
npm install -g npx

# Solution 3: Use direct npm execution
npm exec @justcode-cruzalex/flowforge -- help

# Solution 4: Download from nodejs.org
# Go to https://nodejs.org and download LTS version
```

#### Problem: `npx @justcode-cruzalex/flowforge: command not found`
```bash
# Error after running npx command
npx: command not found: @justcode-cruzalex/flowforge
```

**Solutions:**
```bash
# Check package availability
npm info @justcode-cruzalex/flowforge

# Ensure correct syntax
npx @justcode-cruzalex/flowforge help
# NOT: npx flowforge help

# Clear npm cache and retry
npm cache clean --force
npx @justcode-cruzalex/flowforge help

# Try with explicit registry
npx --registry=https://registry.npmjs.org @justcode-cruzalex/flowforge help
```

---

### 2. GitHub Authentication Issues

#### Problem: GitHub API Authentication Failed
```bash
# Error messages:
# "Bad credentials" or "API rate limit exceeded"
# "Request failed with status code 401"
```

**Cause**: Missing or invalid GitHub Personal Access Token.

**Solutions:**

```bash
# Step 1: Create GitHub Personal Access Token
# 1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Generate new token with these scopes:
#    - repo (full repository access)
#    - workflow (GitHub Actions access)
#    - read:org (organization access if needed)

# Step 2: Set environment variable
export GITHUB_TOKEN=ghp_your_token_here

# Step 3: Make it permanent
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
source ~/.bashrc

# For zsh users
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc

# Step 4: Verify token works
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
# Should return your GitHub user info

# Step 5: Test with FlowForge
flowforge project:status
```

#### Problem: GitHub Two-Factor Authentication Issues
```bash
# Error: "Must specify two-factor authentication OTP code"
```

**Solutions:**
```bash
# Use Personal Access Token instead of username/password
# Tokens work with 2FA automatically

# If using git commands through FlowForge:
git config --global user.name "Your GitHub Username"
git config --global user.email "your.email@example.com"

# For HTTPS URLs, git will use your PAT automatically
# when GITHUB_TOKEN environment variable is set
```

---

### 3. Token Permission Problems

#### Problem: Insufficient GitHub Token Permissions
```bash
# Error messages:
# "Resource not accessible by integration"
# "You don't have permission to access this resource"
```

**Cause**: GitHub token doesn't have required scopes.

**Solutions:**

```bash
# Check current token permissions
curl -H "Authorization: token $GITHUB_TOKEN" -I https://api.github.com/user
# Look for X-OAuth-Scopes header

# Required scopes for FlowForge:
# - repo: Repository access (read/write)
# - workflow: GitHub Actions access
# - read:org: Organization access (if using org repos)
# - user:email: Email access for commits

# Create new token with correct permissions:
# 1. Go to GitHub Settings → Developer settings → Personal access tokens
# 2. Delete old token
# 3. Generate new token with required scopes
# 4. Update environment variable

export GITHUB_TOKEN=new_token_with_correct_scopes
echo 'export GITHUB_TOKEN=new_token_with_correct_scopes' >> ~/.bashrc
```

#### Problem: Expired or Revoked Token
```bash
# Error: "token_expired" or "token_revoked"
```

**Solutions:**
```bash
# Check token status
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
# Will return 401 if token is invalid

# Generate new token
# 1. Go to GitHub Settings → Personal access tokens
# 2. Generate new token (copy the value)
# 3. Update environment variable
export GITHUB_TOKEN=new_token_here
echo 'export GITHUB_TOKEN=new_token_here' >> ~/.bashrc
source ~/.bashrc

# Test new token
flowforge project:status
```

---

### 4. Registry Configuration Errors

#### Problem: Cannot Find Package on Registry
```bash
# Error messages:
# "404 Not Found - GET https://registry.npmjs.org/@justcode-cruzalex%2fflowforge"
# "Package '@justcode-cruzalex/flowforge' not found"
```

**Cause**: Incorrect registry configuration or package not published.

**Solutions:**

```bash
# Check npm registry configuration
npm config get registry
# Should be: https://registry.npmjs.org/

# Reset to default registry
npm config set registry https://registry.npmjs.org/

# Clear npm cache
npm cache clean --force

# Try installation again
npm install -g @justcode-cruzalex/flowforge

# If still failing, try explicit registry
npm install -g @justcode-cruzalex/flowforge --registry=https://registry.npmjs.org/

# For npx users
npx --registry=https://registry.npmjs.org @justcode-cruzalex/flowforge help
```

#### Problem: GitHub Package Registry Configuration Issues
```bash
# Error when trying to publish or access private packages
# "403 Forbidden" or "Login required"
```

**Solutions:**
```bash
# Only needed for publishing - not for installation
# Check if you have .npmrc file with incorrect settings
cat ~/.npmrc

# Remove GitHub registry config if present (for regular users)
# Keep this line ONLY if you're a FlowForge contributor:
# @justcode-cruzalex:registry=https://npm.pkg.github.com

# For contributors only - proper GitHub registry setup:
cat >> ~/.npmrc << 'EOF'
@justcode-cruzalex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
//npm.pkg.github.com/:always-auth=false
EOF

# Verify configuration
npm config list
```

---

### 5. Network/Proxy Issues

#### Problem: Network Timeouts or Connection Refused
```bash
# Error messages:
# "ETIMEDOUT" or "ECONNREFUSED"
# "Request timeout" or "Network error"
```

**Solutions:**

```bash
# Check internet connection
ping registry.npmjs.org

# Check npm proxy settings
npm config get proxy
npm config get https-proxy

# If behind corporate proxy, configure npm:
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
npm config set strict-ssl false  # Only if SSL issues

# Alternative: Use different registry
npm config set registry https://registry.npm.taobao.org/

# For npx with proxy
npx --proxy http://proxy.company.com:8080 @justcode-cruzalex/flowforge help

# Increase timeout
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
```

#### Problem: SSL Certificate Issues
```bash
# Error: "SSL Error" or "certificate verify failed"
```

**Solutions:**
```bash
# Temporary fix (not recommended for production)
npm config set strict-ssl false

# Better solution: Fix certificates
# Update certificate store or configure corporate certificates

# For corporate environments
npm config set cafile /path/to/corporate-cert.pem

# Restore strict SSL after fixing certificates
npm config set strict-ssl true
```

#### Problem: Firewall Blocking npm
```bash
# Error: Connection blocked by firewall
```

**Solutions:**
```bash
# Use HTTPS instead of HTTP
npm config set registry https://registry.npmjs.org/

# Configure alternative ports if needed
npm config set registry https://registry.npmjs.org:443/

# Use offline installation if available
npm install --offline @justcode-cruzalex/flowforge

# Contact IT for firewall rules (ports 80, 443, 22 for npm/git)
```

---

### 6. Version Conflicts

#### Problem: Multiple FlowForge Versions Installed
```bash
# Error: Commands behave inconsistently or show wrong version
```

**Solutions:**

```bash
# Check all installed versions
npm list -g | grep flowforge
npm list | grep flowforge  # In project directory

# Uninstall all versions
npm uninstall -g @justcode-cruzalex/flowforge
npm uninstall @justcode-cruzalex/flowforge  # If installed locally

# Clear npm cache
npm cache clean --force

# Install latest version only
npm install -g @justcode-cruzalex/flowforge

# Verify single installation
flowforge --version
which flowforge
```

#### Problem: Node.js Version Conflicts
```bash
# Error: "Unsupported Node.js version" or compatibility issues
```

**Solutions:**
```bash
# Check current Node.js version
node --version

# FlowForge requires Node.js 14.0.0 or higher
# Use Node Version Manager for clean management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use compatible version
nvm install 18  # LTS version
nvm use 18
nvm alias default 18

# Verify compatibility
node --version  # Should be 18.x.x
npm --version   # Should be compatible

# Reinstall FlowForge with correct Node version
npm install -g @justcode-cruzalex/flowforge
```

#### Problem: Dependency Version Conflicts
```bash
# Error: "Conflicting peer dependency" or "ERESOLVE"
```

**Solutions:**
```bash
# Check for conflicting dependencies
npm ls --depth=0

# Force clean installation
npm install -g @justcode-cruzalex/flowforge --force

# Use npm legacy peer deps (if needed)
npm install -g @justcode-cruzalex/flowforge --legacy-peer-deps

# Alternative: Use npx to avoid dependency conflicts
npx @justcode-cruzalex/flowforge help
```

---

### 7. Installation Failures

#### Problem: Installation Process Fails Midway
```bash
# Error: "Installation failed" or scripts error out
```

**Solutions:**

```bash
# Check available disk space
df -h

# Check permissions on npm directories
ls -la ~/.npm
ls -la $(npm config get prefix)

# Clear npm cache and temp files
npm cache clean --force
rm -rf ~/.npm/_cacache

# Try installation with verbose output
npm install -g @justcode-cruzalex/flowforge --verbose

# If global installation fails, try npx
npx @justcode-cruzalex/flowforge help

# Manual cleanup and retry
npm uninstall -g @justcode-cruzalex/flowforge
npm cache clean --force
npm install -g @justcode-cruzalex/flowforge
```

#### Problem: Post-Install Scripts Fail
```bash
# Error during or after npm installation
```

**Solutions:**
```bash
# Skip post-install scripts if they're causing issues
npm install -g @justcode-cruzalex/flowforge --ignore-scripts

# Check script execution permissions
ls -la $(npm config get prefix)/lib/node_modules/@justcode-cruzalex/flowforge/

# Manual post-install if needed
cd $(npm config get prefix)/lib/node_modules/@justcode-cruzalex/flowforge/
npm run postinstall
```

#### Problem: Insufficient Disk Space
```bash
# Error: "ENOSPC: no space left on device"
```

**Solutions:**
```bash
# Check disk space
df -h

# Clear npm cache to free space
npm cache clean --force

# Clear temporary files
rm -rf /tmp/npm-*

# Use different npm cache location if needed
npm config set cache /path/to/larger/disk/.npm-cache

# Clean other npm packages you don't need
npm uninstall -g package-name
```

---

### 8. Common Error Messages and Solutions

#### `Error: Cannot find module '@justcode-cruzalex/flowforge'`
```bash
# Solutions:
# 1. Verify package is installed
npm list -g @justcode-cruzalex/flowforge

# 2. Reinstall package
npm install -g @justcode-cruzalex/flowforge

# 3. Use npx as alternative
npx @justcode-cruzalex/flowforge help

# 4. Check NODE_PATH (rarely needed)
echo $NODE_PATH
```

#### `Error: FlowForge requires a git repository`
```bash
# Solutions:
# 1. Initialize git repository
git init

# 2. Or run from existing git repository
cd /path/to/your/git/repo
flowforge help

# 3. Or use commands that don't require git
flowforge --version
flowforge help
```

#### `Error: GITHUB_TOKEN is required`
```bash
# Solutions:
# 1. Set GitHub token
export GITHUB_TOKEN=your_github_token_here
echo 'export GITHUB_TOKEN=your_github_token_here' >> ~/.bashrc

# 2. Or use commands that don't require GitHub
flowforge help
flowforge --version
flowforge config show
```

#### `Error: Permission denied writing to .flowforge directory`
```bash
# Solutions:
# 1. Check current directory permissions
ls -la .

# 2. Change permissions if you own the directory
chmod u+w .

# 3. Or run from writable directory
cd ~
mkdir my-flowforge-project
cd my-flowforge-project
git init
flowforge init
```

#### `Error: Git hooks installation failed`
```bash
# Solutions:
# 1. Check git repository status
git status

# 2. Ensure .git directory exists and is writable
ls -la .git/
chmod -R u+w .git/hooks/

# 3. Force hooks installation
flowforge init --force

# 4. Manual hooks installation if needed
cp ~/.flowforge/hooks/* .git/hooks/
chmod +x .git/hooks/*
```

#### `Error: Command 'flowforge' not found after installation`
```bash
# Solutions:
# 1. Check if installation was successful
npm list -g @justcode-cruzalex/flowforge

# 2. Check PATH includes npm global bin
echo $PATH
npm config get prefix

# 3. Add npm global bin to PATH
export PATH=$(npm config get prefix)/bin:$PATH
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc

# 4. Use npx as workaround
npx @justcode-cruzalex/flowforge help

# 5. Reinstall in different location
mkdir ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @justcode-cruzalex/flowforge
```

#### `Error: FlowForge session already active`
```bash
# Solutions:
# 1. End current session
flowforge session:end

# 2. Check session status
flowforge session:status

# 3. Force end session if stuck
flowforge session:end --force

# 4. Clear session files manually
rm -f .flowforge/.session
```

---

### Advanced Troubleshooting

#### Debug Mode
```bash
# Enable debug output for detailed troubleshooting
DEBUG=flowforge:* flowforge help
NODE_DEBUG=flowforge flowforge help

# Check FlowForge internal configuration
flowforge config show --internal

# Verify system environment
flowforge system:check
```

#### Log Files
```bash
# Check FlowForge logs
ls -la .flowforge/logs/
cat .flowforge/logs/error.log
tail -f .flowforge/logs/debug.log

# Check npm logs
npm config get cache
ls -la ~/.npm/_logs/
```

#### Complete Reset
```bash
# Nuclear option - complete FlowForge reset
rm -rf ~/.flowforge
rm -rf .flowforge
npm uninstall -g @justcode-cruzalex/flowforge
npm cache clean --force
npm install -g @justcode-cruzalex/flowforge
git init  # If needed
flowforge init
```

#### Getting Additional Help
```bash
# Built-in diagnostics
flowforge doctor
flowforge system:info

# Community support
# 1. Check existing issues: https://github.com/JustCode-CruzAlex/FlowForge/issues
# 2. Create new issue with error details
# 3. Include output from: flowforge system:info
```

---

### Environment-Specific Issues

#### macOS-Specific Issues
```bash
# Xcode Command Line Tools required
xcode-select --install

# Homebrew conflicts
brew uninstall node  # If installed via Homebrew
# Then install via nvm or nodejs.org

# Permission issues with system directories
sudo chown -R $(whoami) $(npm config get prefix)
```

#### Linux-Specific Issues
```bash
# Install build essentials if needed
sudo apt-get install build-essential  # Ubuntu/Debian
sudo yum groupinstall "Development Tools"  # CentOS/RHEL

# Permission issues
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER $(npm config get prefix)

# SELinux issues (if applicable)
setsebool -P httpd_can_network_connect on
```

#### Windows WSL Issues
```bash
# Use Linux commands in WSL
# Ensure you're using Linux-style paths, not Windows paths

# Node.js version in WSL
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fix line ending issues
git config --global core.autocrlf false
```

---

**🚨 Critical Support Information**

If you encounter issues not covered here:

1. **Gather Information**:
   ```bash
   flowforge system:info > debug-info.txt
   npm config list >> debug-info.txt
   node --version >> debug-info.txt
   echo $PATH >> debug-info.txt
   ```

2. **Check Known Issues**: [GitHub Issues](https://github.com/JustCode-CruzAlex/FlowForge/issues)

3. **Create Support Request**: Include debug-info.txt in your issue report

4. **Emergency Workaround**: Use NPX if global installation fails:
   ```bash
   # Always works as fallback
   npx @justcode-cruzalex/flowforge help
   ```

---

## Getting Help

### Built-in Help System

```bash
# General help
flowforge help

# Command-specific help
flowforge help session:start
flowforge help dev:checkrules

# List all commands
flowforge help --all

# Show command examples
flowforge help --examples
```

### Online Resources

- **Documentation**: [FlowForge Docs](https://github.com/JustCode-CruzAlex/FlowForge/tree/main/documentation)
- **Issues**: [GitHub Issues](https://github.com/JustCode-CruzAlex/FlowForge/issues)
- **Package Page**: [GitHub Package Registry](https://github.com/JustCode-CruzAlex/FlowForge/packages)

### Community Support

- **GitHub Discussions**: Report issues and get community help
- **Documentation Issues**: Help improve this guide
- **Feature Requests**: Suggest new features

## Updates and Maintenance

### Checking for Updates

```bash
# Check current version
flowforge --version

# Check for available updates
npm info @justcode-cruzalex/flowforge version

# For globally installed packages
npm outdated -g @justcode-cruzalex/flowforge
```

### Updating FlowForge

```bash
# For NPX users - automatic (uses latest version)
npx @justcode-cruzalex/flowforge

# For global installation
npm update -g @justcode-cruzalex/flowforge

# For project-specific installation
npm update @justcode-cruzalex/flowforge
```

### Version Management

```bash
# Install specific version
npm install -g @justcode-cruzalex/flowforge@2.0.3

# Revert to previous version if needed
npm install -g @justcode-cruzalex/flowforge@2.0.2

# Check version history
npm info @justcode-cruzalex/flowforge versions --json
```

## Security Considerations

### Best Practices

1. **Token Security**:
   ```bash
   # Never commit tokens to version control
   echo ".env" >> .gitignore
   echo "GITHUB_TOKEN=your_token" >> .env
   ```

2. **Permissions**:
   ```bash
   # Use minimal required permissions
   # Only grant necessary GitHub token scopes
   ```

3. **Updates**:
   ```bash
   # Keep FlowForge updated for security patches
   npm update -g @justcode-cruzalex/flowforge
   ```

4. **Environment Isolation**:
   ```bash
   # Use project-specific installations when possible
   npm install @justcode-cruzalex/flowforge --save-dev
   ```

## Next Steps

After successful installation:

1. **Read the Getting Started Guide**: `/documentation/2.0/getting-started/`
2. **Explore FlowForge Agents**: `/documentation/2.0/agents/`
3. **Set Up Your First Project**: Follow the project setup wizard
4. **Configure GitHub Integration**: Set up repository connections
5. **Learn the Workflow**: Practice with sample projects

## Conclusion

FlowForge installation is designed to be straightforward and flexible. Choose the installation method that best fits your workflow:

- **NPX**: Best for trying out or occasional use
- **Global**: Best for regular development work
- **Project-specific**: Best for team environments and version control

For additional help or issues not covered in this guide, please refer to the GitHub repository or open an issue for community support.

---

**FlowForge v2.0.3 - AI-Powered Developer Productivity Framework**  
*Zero-friction development workflow for professional developers*