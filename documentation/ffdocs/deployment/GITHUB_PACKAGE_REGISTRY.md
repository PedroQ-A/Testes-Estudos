# GitHub Package Registry Configuration

## Overview
FlowForge is configured to use GitHub Package Registry for distribution while maintaining repository privacy. This setup allows:
- **Public package access** via NPX without authentication
- **Private repository** remains secure
- **Controlled publishing** with authentication

## Configuration Details

### Package Name
- **Scope**: `@justcode-cruzalex`
- **Package**: `flowforge`
- **Full Name**: `@justcode-cruzalex/flowforge`

### Registry Settings
- **Registry URL**: `https://npm.pkg.github.com`
- **Access Level**: `public` (package only, not repository)
- **Authentication**: Required for publishing only

## Installation Methods

### 1. NPX (No Authentication Required)
```bash
# Direct execution without installation
npx @justcode-cruzalex/flowforge

# With specific command
npx @justcode-cruzalex/flowforge session:start
```

### 2. Global Installation
```bash
# Install globally
npm install -g @justcode-cruzalex/flowforge

# Use the CLI
flowforge session:start
# or
ff session:start
```

### 3. Project Dependency
```bash
# Add to project
npm install @justcode-cruzalex/flowforge

# Add to package.json scripts
{
  "scripts": {
    "ff": "flowforge"
  }
}
```

## Publishing Instructions

### Prerequisites
1. **GitHub Personal Access Token (PAT)**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a token with `write:packages` permission
   - Save the token securely

2. **Set Environment Variable**
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

### Publishing Process
```bash
# 1. Ensure you're logged in to GitHub registry
npm login --registry=https://npm.pkg.github.com --scope=@justcode-cruzalex

# 2. Build the package
npm run build

# 3. Publish to GitHub Package Registry
npm publish

# The package will be publicly accessible immediately
```

## Configuration Files

### `.npmrc`
```ini
# Configure registry for scope
@justcode-cruzalex:registry=https://npm.pkg.github.com

# Authentication token (uses environment variable)
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Don't require auth for package installation
//npm.pkg.github.com/:always-auth=false
```

### `package.json`
```json
{
  "name": "@justcode-cruzalex/flowforge",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  }
}
```

## Security Considerations

### What's Public
- ✅ The package itself (for NPX access)
- ✅ Package metadata (name, version, description)
- ✅ Package contents as defined in `files` array

### What Remains Private
- 🔒 Repository source code
- 🔒 Development files not in `files` array
- 🔒 Git history and commits
- 🔒 Issues and pull requests
- 🔒 GitHub Actions and workflows

### Best Practices
1. **Never commit tokens** - Always use environment variables
2. **Use `.gitignore`** - Ensure `.npmrc` with tokens is ignored
3. **Rotate tokens regularly** - Update PATs periodically
4. **Minimal permissions** - Only grant necessary scopes to PATs
5. **Review `files` array** - Ensure only necessary files are published

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
```bash
# Error: 401 Unauthorized
# Solution: Check GITHUB_TOKEN is set correctly
echo $GITHUB_TOKEN  # Should show your token
```

#### 2. Package Not Found
```bash
# Error: 404 Not Found
# Solution: Ensure package is published and public
npm view @justcode-cruzalex/flowforge
```

#### 3. NPX Not Working
```bash
# Error: Package not found
# Solution: Wait 5-10 minutes after publishing for CDN propagation
```

#### 4. Publishing Fails
```bash
# Error: 403 Forbidden
# Solution: Ensure token has write:packages permission
# Verify with:
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## Version Management

### Semantic Versioning
- **Major**: Breaking changes (3.0.0)
- **Minor**: New features (2.1.0)
- **Patch**: Bug fixes (2.0.4)

### Version Commands
```bash
# Increment patch version
npm version patch

# Increment minor version
npm version minor

# Increment major version
npm version major

# Publish new version
npm publish
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Monitoring

### Package Statistics
View package statistics at:
```
https://github.com/JustCode-CruzAlex/FlowForge/packages
```

### Download Metrics
Track usage through:
- GitHub Insights
- Package page statistics
- NPM download counts (if mirrored)

## Migration Notes

### From NPM Registry
If migrating from npmjs.org:
1. Update package name to include scope
2. Update `.npmrc` with GitHub registry
3. Update `publishConfig` in `package.json`
4. Inform users of new installation command

### Rollback Plan
To revert to NPM registry:
1. Change `publishConfig.registry` back to `https://registry.npmjs.org/`
2. Remove GitHub-specific `.npmrc` entries
3. Publish to NPM with existing credentials

---

**Note**: This configuration allows FlowForge to maintain a private repository while providing public package access, enabling zero-friction installation via NPX for all developers.