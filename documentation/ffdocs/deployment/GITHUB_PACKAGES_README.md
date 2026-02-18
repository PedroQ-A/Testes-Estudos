# FlowForge on GitHub Package Registry

## Quick Start

FlowForge is available as a public package on GitHub Package Registry, allowing instant access via NPX without authentication.

### Installation Options

#### 1. Direct Execution (Recommended)
```bash
npx @justcode-cruzalex/flowforge
```

#### 2. Global Installation
```bash
npm install -g @justcode-cruzalex/flowforge
flowforge  # or 'ff' for short
```

#### 3. Project Dependency
```bash
npm install @justcode-cruzalex/flowforge --save-dev
```

## Configuration Details

### Package Information
- **Registry**: GitHub Package Registry
- **Scope**: `@justcode-cruzalex`
- **Package**: `flowforge`
- **Access**: Public (no authentication required for installation)
- **Repository**: Private (source code protected)

### Why GitHub Package Registry?

1. **Public Package, Private Repo**: Keep source code private while allowing public package access
2. **NPX Support**: Zero-friction installation for developers
3. **GitHub Integration**: Seamless CI/CD with GitHub Actions
4. **Version Control**: Direct connection to releases and tags

## For Publishers

### Setup Requirements

1. **GitHub Personal Access Token**
   - Go to: Settings → Developer settings → Personal access tokens
   - Create token with `write:packages` permission
   - Set as environment variable: `export GITHUB_TOKEN=your_token`

2. **Publishing Commands**
   ```bash
   # Verify configuration
   npm run verify:registry
   
   # Publish to GitHub Package Registry
   npm run publish:github
   ```

### Manual Publishing
```bash
# 1. Set authentication
export GITHUB_TOKEN=your_github_token

# 2. Build the package
npm run build

# 3. Publish
npm publish
```

## Configuration Files

### `.npmrc`
```ini
@justcode-cruzalex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
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

## Troubleshooting

### Installation Issues

**Error: Package not found**
- Wait 5-10 minutes after publishing for CDN propagation
- Verify package name: `@justcode-cruzalex/flowforge`

**Error: 401 Unauthorized**
- Public packages don't require authentication for installation
- Check if you're behind a corporate proxy

### Publishing Issues

**Error: 403 Forbidden**
- Ensure GITHUB_TOKEN has `write:packages` permission
- Verify token: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

**Error: 409 Conflict**
- Version already exists, increment version in package.json
- Use: `npm version patch` then publish again

## Security Notes

- **Never commit tokens** to repository
- **Use environment variables** for authentication
- **Rotate tokens** regularly
- **Minimal permissions** - only grant necessary scopes

## Support

- **Package Page**: https://github.com/JustCode-CruzAlex/FlowForge/packages
- **Issues**: https://github.com/JustCode-CruzAlex/FlowForge/issues
- **Documentation**: See `/documentation/2.0/deployment/GITHUB_PACKAGE_REGISTRY.md`

---

*FlowForge - AI-Powered Developer Productivity Framework*