# 🔧 FlowForge Landing Page - MCP Setup Guide

## ✅ Current MCP Configuration Status

### Already Configured MCPs

#### 1. **Context7 MCP** ✅
- **Status**: Configured and working
- **Package**: `@rakuv3r/open-context7-mcp@latest`
- **Purpose**: Access to real-time documentation for libraries
- **API**: Using public API at `https://api.context7.ai`

#### 2. **Playwright MCP** ✅
- **Status**: Configured and working
- **Package**: `@automatalabs/mcp-server-playwright@latest`
- **Purpose**: Browser automation, screenshots, testing

### Newly Added MCPs

#### 3. **shadcn/ui MCP** 🆕
- **Status**: Just configured
- **Package**: `@ymadd/shadcn-ui-mcp-server@latest`
- **Purpose**: Access to shadcn/ui components and documentation
- **Features**:
  - Component information scraping
  - Cached component data
  - Structured access to shadcn/ui patterns

#### 4. **Stripe MCP** 🆕
- **Status**: Configured (needs API key)
- **Package**: `@stripe/mcp-server-stripe@latest`
- **Purpose**: Payment processing integration
- **Note**: Requires `STRIPE_API_KEY` environment variable

---

## 📋 Complete Configuration File

Your Claude configuration is located at:
```
/home/cruzalex/.config/claude/claude_desktop_config.json
```

Current configuration:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@rakuv3r/open-context7-mcp@latest"],
      "env": {
        "CONTEXT7_API_BASE_URL": "https://api.context7.ai"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright@latest"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@ymadd/shadcn-ui-mcp-server@latest"]
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server-stripe@latest"],
      "env": {
        "STRIPE_API_KEY": "${STRIPE_API_KEY}"
      }
    }
  }
}
```

---

## 🚀 Activation Steps

### 1. Restart Claude Code
After updating the configuration, you need to restart Claude Code for the changes to take effect:
- Close Claude Code completely
- Reopen Claude Code
- The MCPs will be automatically loaded

### 2. Verify MCPs are Loaded
After restart, check if MCPs are available:
- Type `/` in Claude Code
- You should see MCP-related commands
- Or check the MCP status in Claude Code settings

### 3. Set Up Stripe API Key (if using Stripe)
If you plan to use the Stripe MCP, set the API key:

**Option A: Set in environment before starting Claude**
```bash
export STRIPE_API_KEY="your-stripe-api-key"
claude  # or however you launch Claude Code
```

**Option B: Add to your shell profile**
```bash
echo 'export STRIPE_API_KEY="your-stripe-api-key"' >> ~/.bashrc
# or ~/.zshrc if using zsh
source ~/.bashrc
```

---

## 🔍 How to Use Each MCP in Your Landing Page Build

### Using Context7 MCP
```markdown
# In your prompts, you can now request:
"Use Context7 to get the latest Next.js App Router documentation"
"Query Context7 for shadcn/ui button component patterns"
"Get Tailwind CSS responsive design best practices from Context7"
```

### Using Playwright MCP
```markdown
# Browser automation commands:
"Open http://localhost:3000 with Playwright and take a screenshot"
"Use Playwright to test the responsive design at mobile viewport"
"Navigate through the signup flow and verify all forms work"
```

### Using shadcn MCP
```markdown
# Component information:
"Get shadcn/ui Card component documentation"
"Show me all available shadcn/ui form components"
"Provide shadcn/ui Dialog implementation example"
```

### Using Stripe MCP (when configured)
```markdown
# Payment integration:
"Set up Stripe payment form"
"Create a Stripe checkout session"
"Implement Stripe subscription pricing"
```

---

## 📝 Updated Prompt Examples with MCP Integration

### Example 1: Building Hero Section with MCPs
```markdown
Create a hero section for FlowForge landing page:

1. Use Context7 to get the latest Next.js 14 App Router patterns for hero sections
2. Use shadcn MCP to get Button and Badge component implementations
3. Apply FlowForge brand colors (#8B5CF6, #A855F7, #3B82F6)
4. After building, use Playwright MCP to take screenshots at desktop/mobile viewports
5. Validate the gradient backgrounds and button hover states
```

### Example 2: Form with Validation
```markdown
Build a contact form using:

1. Query shadcn MCP for Form, Input, and Button components
2. Use Context7 to get react-hook-form best practices
3. Implement Zod validation schema
4. Style with FlowForge colors
5. Use Playwright to test form submission and validation
6. Take screenshots of form states (empty, filled, error, success)
```

### Example 3: Responsive Testing
```markdown
Test landing page responsiveness:

1. Use Playwright MCP to open the landing page
2. Take screenshots at:
   - Desktop: 1920x1080
   - Tablet: 768x1024
   - Mobile: 375x667
3. Check for layout issues
4. Verify all shadcn components render correctly
5. Test mobile navigation menu functionality
```

---

## 🛠️ Troubleshooting

### MCP Not Loading
1. Ensure configuration file is valid JSON
2. Check file permissions: `chmod 644 ~/.config/claude/claude_desktop_config.json`
3. Restart Claude Code completely (not just reload)

### shadcn MCP Issues
- The MCP scrapes shadcn/ui documentation, so internet connection is required
- First run may be slower as it caches component data

### Playwright MCP Issues
- Requires browser to be installed (Chromium by default)
- May need to run `npx playwright install` first time

### Context7 MCP Issues
- Requires internet connection for API access
- Public API has rate limits, but should be sufficient for development

### Stripe MCP Issues
- Won't work without valid API key
- Test mode keys start with `sk_test_`
- Live mode keys start with `sk_live_` (be careful!)

---

## 🎯 Benefits for Landing Page Development

With all MCPs configured, you can:

1. **Faster Development**: Query documentation in real-time without leaving Claude
2. **Visual Validation**: Automatically screenshot and test your landing page
3. **Component Library**: Access shadcn/ui components instantly
4. **Payment Ready**: Integrate Stripe for pricing/payment sections
5. **Best Practices**: Get current best practices from Context7
6. **Automated Testing**: Use Playwright for comprehensive testing

---

## 📚 Additional Resources

- [Context7 Documentation](https://context7.ai/docs)
- [Playwright Documentation](https://playwright.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Stripe API Documentation](https://stripe.com/docs/api)

---

*Configuration saved and ready for your FlowForge landing page presentation!*