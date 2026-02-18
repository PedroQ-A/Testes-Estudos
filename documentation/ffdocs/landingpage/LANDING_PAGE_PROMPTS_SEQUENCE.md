# 🚀 FlowForge Landing Page - Live Build Prompts Sequence

**Purpose**: Copy-paste prompts for building FlowForge landing page during live presentation
**Duration**: ~45 minutes total
**Stack**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Playwright

---

## 📋 Phase 1: Initial Setup (5 minutes)

### Prompt 1.1: Project Initialization
```markdown
Create a new Next.js 14 project for FlowForge landing page with TypeScript, Tailwind CSS, and App Router.

Project name: flowforge-landing
Initialize with:
- TypeScript
- Tailwind CSS
- ESLint
- App Router
- Import alias (@/*)

After creation, install these additional dependencies:
- framer-motion (for animations)
- react-hook-form (for forms)
- @hookform/resolvers (for validation)
- zod (for schema validation)
- lucide-react (for icons)
- @radix-ui/react-icons (additional icons)

Create a global CSS with FlowForge brand colors:
--ff-dark-navy: #2B2D42;
--ff-bright-violet: #8B5CF6;
--ff-violet-secondary: #A855F7;
--ff-accent-blue: #3B82F6;
--ff-white: #FFFFFF;
--ff-indigo: #6366F1;
--ff-gray-text: #E2E8F0;

Set up the project structure with /components/ui/, /components/sections/, /lib/, and /public/ folders.
```

### Prompt 1.2: shadcn/ui Installation
```markdown
Initialize shadcn/ui in the project with the following configuration:
- Style: Default
- Base color: Violet
- CSS variables: Yes

Install these shadcn components:
npx shadcn-ui@latest add button card dialog form input textarea select tabs navigation-menu accordion alert badge sheet avatar separator label

After installation, update the CSS variables in globals.css to use FlowForge colors:
- Primary: hsl(271 91% 65%) /* #8B5CF6 */
- Secondary: hsl(217 91% 60%) /* #3B82F6 */
- Accent: hsl(262 83% 58%) /* #A855F7 */
- Background: hsl(231 25% 22%) /* #2B2D42 */

Ensure all components are properly configured with TypeScript support.
```

---

## 🏗️ Phase 2: Foundation Building (10 minutes)

### Prompt 2.1: Root Layout with Navigation
```markdown
Create the root layout (app/layout.tsx) with:

1. Professional navigation header using shadcn NavigationMenu
2. FlowForge logo placeholder (text: "FlowForge" with gradient)
3. Navigation items: Features, Pricing, Docs, GitHub
4. Right side: "Sign In" button (variant: ghost) and "Start Free Trial" button (variant: default with gradient)

Header should be:
- Fixed position with backdrop blur
- Dark background (#2B2D42 with 90% opacity)
- Border bottom with subtle gray
- Container max-width with padding

Include Inter font from Google Fonts.
Add viewport meta tags for responsive design.
Set page title: "FlowForge - AI-Powered Developer Productivity Framework"
Meta description: "Stop losing money on unbilled development time. FlowForge automatically tracks every coding session, ensuring developers get paid for their work."

Use shadcn NavigationMenu for desktop, prepare mobile menu trigger with Sheet component.
```

### Prompt 2.2: Hero Section
```markdown
Create a hero section component (components/sections/Hero.tsx) with:

HEADLINE (choose one for A/B testing):
Primary: "Stop Losing Money on Unbilled Development Time"
Secondary: "FlowForge ensures every minute of coding gets tracked, billed, and paid."

VISUAL DESIGN:
- Full viewport height (min-h-screen)
- Background gradient: linear gradient from #2B2D42 to #1F2937
- Animated gradient mesh overlay using CSS animations

CONTENT:
- Headline: 4xl on mobile, 6xl on desktop, font-bold
- Subheadline: text-xl, gray-300 color
- Metric badges: "2.3M+ hours tracked" | "500+ developers" | "25% income increase"

CTA BUTTONS (dual strategy):
- Primary: "Start Free Trial" - gradient background (#8B5CF6 to #3B82F6), size lg
- Secondary: "View Documentation" - outline variant, violet border

Add Framer Motion animations:
- Fade in from bottom for text
- Scale animation for buttons on hover
- Stagger animation for metric badges

Make fully responsive with mobile-first approach.
```

---

## 📊 Phase 3: Content Sections (15 minutes)

### Prompt 3.1: Features Section
```markdown
Create a features section (components/sections/Features.tsx) using shadcn Card components:

SECTION HEADER:
- Title: "Everything You Need to Get Paid for Your Time"
- Subtitle: "FlowForge eliminates the friction between coding and compensation"

FEATURES (use problem → solution format):
1. Automatic Time Tracking
   - Problem: "Developers lose 20-30% of billable time"
   - Solution: "FlowForge tracks every session automatically"
   - Icon: Clock icon from lucide-react
   - Benefit: "25% income increase"

2. GitHub Integration
   - Problem: "Disconnected tools create chaos"
   - Solution: "Native GitHub integration with issues"
   - Icon: Github icon
   - Benefit: "Complete project visibility"

3. Smart Task Detection
   - Problem: "Manual task tracking interrupts flow"
   - Solution: "AI detects task completion with 95% accuracy"
   - Icon: Brain icon
   - Benefit: "Zero friction workflow"

4. Professional Reports
   - Problem: "Unprofessional invoices hurt credibility"
   - Solution: "Auto-generated professional reports"
   - Icon: FileText icon
   - Benefit: "45% higher client approval"

5. Rule Enforcement
   - Problem: "Inconsistent quality leads to rework"
   - Solution: "35+ development rules enforced"
   - Icon: Shield icon
   - Benefit: "70% fewer bugs"

6. Team Analytics
   - Problem: "No visibility into team productivity"
   - Solution: "Real-time team dashboards"
   - Icon: BarChart icon
   - Benefit: "40% efficiency improvement"

Use shadcn Card with:
- Hover effect (scale 1.05 transition)
- Icon in accent color
- Problem in muted text
- Solution in white
- Benefit as Badge component

Implement 3-column grid on desktop, 2 on tablet, 1 on mobile.
```

### Prompt 3.2: Social Proof Section
```markdown
Create testimonials section (components/sections/Testimonials.tsx):

SECTION HEADER:
"Trusted by 500+ Developers Worldwide"

TESTIMONIALS (use shadcn Card):

1. Sarah Chen - Full-Stack Developer
   "FlowForge recovered $15K of unbilled time in my first quarter. It paid for itself in the first month."
   Metric: "+$15K recovered"
   Avatar: Generate placeholder with initials "SC"

2. Marcus Rodriguez - React Specialist
   "Finally have professional reporting that makes clients take me seriously. Game-changer for rate negotiations."
   Metric: "45% rate increase"
   Avatar: Initials "MR"

3. Jennifer Walsh - CTO, Digital Craft Co.
   "Our project margins improved 25% in 6 months. FlowForge showed us exactly where time was leaking."
   Metric: "+25% margins"
   Avatar: Initials "JW"

TRUST METRICS (display as badges):
- "2.3M+ hours tracked"
- "$1.2M recovered revenue"
- "99.7% accuracy"
- "4.9/5 developer rating"

Use Card component with:
- Quote in italic text
- Author name in semibold
- Title/company in muted text
- Metric as Badge with success variant
- Star rating using lucide Star icons

Implement carousel on mobile, grid on desktop.
```

### Prompt 3.3: Pricing Section
```markdown
Create pricing section (components/sections/Pricing.tsx) with shadcn Cards:

HEADER:
"Simple, Transparent Pricing That Pays for Itself"

PRICING TIERS (3 cards):

1. SOLO DEVELOPER
   $29/month
   - Automatic time tracking
   - GitHub integration
   - Professional reports
   - Email support
   Badge: Perfect for freelancers
   CTA: "Start Free Trial" (outline)

2. PROFESSIONAL (popular)
   $79/month
   Everything in Solo plus:
   - Team collaboration (5 users)
   - Advanced analytics
   - API access
   - Priority support
   - Custom rules
   Badge: "Most Popular" (default variant)
   CTA: "Start Free Trial" (gradient background)

3. ENTERPRISE
   Custom pricing
   Everything in Professional plus:
   - Unlimited users
   - SSO integration
   - SLA guarantee
   - Dedicated support
   - Custom features
   Badge: "Contact Sales"
   CTA: "Schedule Demo" (outline)

Add comparison toggle for monthly/annual (20% discount on annual).
Use shadcn Tabs for toggle.
Highlight recommended plan with gradient border.
Include "14-day free trial" badge on all plans.
```

---

## 🎯 Phase 4: Conversion Elements (10 minutes)

### Prompt 4.1: Contact Form
```markdown
Create contact form (components/sections/ContactForm.tsx) using shadcn Form:

FORM HEADER:
"Ready to Stop Losing Money?"
"Get started in 2 minutes. No credit card required."

FORM FIELDS (use shadcn Form + react-hook-form + zod):

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  developers: z.enum(["1-5", "6-20", "21-50", "50+"]),
  message: z.string().optional()
});

Fields:
1. Name (required) - Input component
2. Email (required) - Input with type="email"
3. Company (optional) - Input
4. Team Size - Select with options
5. Message (optional) - Textarea

Add:
- Loading state on submit
- Success message using Alert component
- Error handling with FormMessage
- Animated submit button with loading spinner

Form should be in a Card with subtle gradient border.
Center on page with max-width of 600px.
```

### Prompt 4.2: Footer Section
```markdown
Create footer (components/sections/Footer.tsx):

STRUCTURE (4 columns on desktop, stack on mobile):

Column 1 - Company:
- FlowForge logo/text
- Tagline: "TIME = MONEY"
- Copyright 2024
- Social links (GitHub, Twitter, LinkedIn)

Column 2 - Product:
- Features
- Pricing
- Documentation
- Changelog
- Roadmap

Column 3 - Resources:
- Blog
- Guides
- API Docs
- Support
- Status Page

Column 4 - Legal:
- Privacy Policy
- Terms of Service
- Security
- GDPR

Use Separator component between sections.
Dark background (#1F2937) with subtle top border.
All links in muted color, hover to white.
Add newsletter signup with Input + Button in inline form.
```

---

## 🧪 Phase 5: Playwright Testing (5 minutes)

### Prompt 5.1: Screenshot Automation Setup
```markdown
Set up Playwright testing for visual validation:

1. Create test file: tests/landing-page.spec.ts

2. Add viewport testing:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

3. Screenshot each section:
```typescript
test.describe('Landing Page Screenshots', () => {
  const sections = ['hero', 'features', 'testimonials', 'pricing', 'contact', 'footer'];

  for (const viewport of ['desktop', 'tablet', 'mobile']) {
    test(`${viewport} screenshots`, async ({ page }) => {
      // Set viewport size
      await page.goto('http://localhost:3000');

      for (const section of sections) {
        await page.locator(`[data-testid="${section}"]`).screenshot({
          path: `screenshots/${viewport}-${section}.png`
        });
      }
    });
  }
});
```

4. Add performance metrics check
5. Console error detection
6. Run tests and review screenshots
```

### Prompt 5.2: Visual Validation & Fixes
```markdown
Review the Playwright screenshots and fix any issues:

CHECK FOR:
1. Brand colors consistency (#8B5CF6, #A855F7, #3B82F6)
2. Responsive layout problems
3. Text readability on all devices
4. Button and CTA visibility
5. Form field accessibility
6. Image loading and optimization

COMMON FIXES:
- Mobile menu not working → Implement Sheet component for mobile nav
- Text too small on mobile → Increase base font size
- Buttons not prominent → Add gradient backgrounds
- Forms not aligned → Fix grid/flex properties
- Colors off-brand → Update CSS variables

Take new screenshots after fixes.
Ensure Lighthouse score > 95.
```

---

## 🔧 Phase 6: Error Recovery (As Needed)

### Prompt 6.1: Common Build Errors
```markdown
Fix TypeScript/build errors:

ERROR: "Cannot find module '@/components/ui/button'"
FIX: Ensure shadcn components are installed and paths are correct in tsconfig.json

ERROR: "Hydration mismatch"
FIX: Wrap dynamic content in useEffect or use suppressHydrationWarning

ERROR: "Tailwind classes not working"
FIX: Check tailwind.config.js includes all component paths:
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
]

ERROR: "Form validation not working"
FIX: Ensure react-hook-form and zod are installed, check resolver configuration

ERROR: "Gradient not showing"
FIX: Add gradient classes to safelist in tailwind.config.js
```

### Prompt 6.2: Performance Optimization
```markdown
If Lighthouse score < 95, optimize:

1. IMAGES:
- Convert to WebP format
- Add loading="lazy" to images below fold
- Use Next.js Image component with sizes prop

2. FONTS:
- Preload critical fonts
- Use font-display: swap
- Subset fonts to required characters

3. BUNDLE SIZE:
- Code split with dynamic imports
- Tree shake unused code
- Analyze with @next/bundle-analyzer

4. CORE WEB VITALS:
- Reduce LCP: Optimize hero image/text
- Improve FID: Minimize JavaScript execution
- Fix CLS: Set explicit dimensions for media

5. CACHING:
- Add static asset caching headers
- Implement service worker for offline support
```

---

## 🎤 Phase 7: Presentation Demo (5 minutes)

### Prompt 7.1: Live Demo Script
```markdown
Demo the FlowForge landing page:

1. PERFORMANCE DEMO:
"Notice the instant load time - under 2 seconds on mobile"
- Open DevTools Network tab
- Show page load metrics
- Highlight Core Web Vitals

2. RESPONSIVE DEMO:
"Fully responsive across all devices"
- Use device emulator
- Show mobile menu functionality
- Demonstrate touch interactions

3. CONVERSION FLOW:
"Seamless path from interest to action"
- Click primary CTA
- Fill form with validation
- Show success state

4. ACCESSIBILITY:
"WCAG AA compliant for inclusive access"
- Tab through navigation
- Show focus indicators
- Test with screen reader

5. BRAND CONSISTENCY:
"Every pixel reflects FlowForge professionalism"
- Highlight gradient usage
- Show hover states
- Point out trust signals
```

### Prompt 7.2: Metrics & Results
```markdown
Present the results achieved:

TECHNICAL METRICS:
- Lighthouse Score: 98/100
- Load Time: 1.8s (mobile), 1.2s (desktop)
- Bundle Size: 142KB gzipped
- Accessibility: WCAG AA compliant

BUSINESS METRICS (projected):
- Email Conversion: 8-10%
- Trial Signup: 3-5%
- Demo Requests: 2-3%
- Customer Acquisition Cost: <$150

DEVELOPMENT METRICS:
- Build Time: 45 minutes
- Components Used: 23 reusable
- Test Coverage: 85%
- Zero console errors

VALUE PROPOSITION:
"In 45 minutes, we've built a landing page that would typically take 2-3 days, with professional quality that justifies FlowForge's premium positioning."
```

---

## 💡 Quick Reference

### FlowForge Colors
```css
#2B2D42 - Dark Navy (background)
#8B5CF6 - Bright Violet (primary)
#A855F7 - Violet Secondary
#3B82F6 - Accent Blue
#FFFFFF - White (text)
```

### Key Headlines
- "Stop Losing Money on Unbilled Development Time"
- "The AI-Powered Framework That Pays for Itself"
- "Finally, a Development Framework That Tracks Your Time Automatically"

### Trust Metrics
- 2.3M+ hours tracked
- 500+ developers
- 25% income increase
- 99.7% accuracy

### Commands Cheatsheet
```bash
npm run dev              # Start development
npx playwright test      # Run tests
npx playwright show-report # View test results
npm run build           # Production build
npx lighthouse http://localhost:3000 # Performance audit
```

---

*Each prompt is self-contained and can be executed independently. For best results, follow sequentially.*