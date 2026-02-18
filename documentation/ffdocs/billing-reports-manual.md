# FlowForge v2.0 Billing Reports Manual

## Overview

FlowForge v2.0's Billing Reports system provides accurate, audit-ready billing data while maintaining strict developer privacy protection. This manual covers everything from basic report generation to advanced analytics and client billing automation.

**Core Promise**: Generate precise billing reports in seconds, not hours, with complete confidence in data accuracy and privacy compliance.

## Quick Start

### Generate Your First Billing Report

```bash
# Basic team billing report for current week
flowforge:billing:generate --week current

# Output saved to: .flowforge/reports/billing/weekly-2025-W36.pdf
# Report Summary:
# - Team: Development Team  
# - Period: Sep 1-7, 2025
# - Total Hours: 187.5 hours
# - Billable Hours: 172.8 hours
# - Revenue: $25,920 (at $150/hour)
```

### View Report in Terminal

```bash
# Quick summary without generating PDF
flowforge:billing:summary --week current

# Development Team Billing Summary
# =================================
# Week: September 1-7, 2025
# 
# 👥 Team Performance:
# • Total developers: 4 active
# • Total hours tracked: 187.5
# • Billable hours: 172.8 (92% billable rate)
# • Non-billable: 14.7 (meetings, admin, etc.)
# 
# 📊 Project Breakdown:
# • User Authentication (Issue #456): 68.5 hours
# • Database Migration (Issue #789): 52.3 hours  
# • Bug Fixes (Issues #101-105): 31.2 hours
# • Code Review & Testing: 20.8 hours
# 
# 💰 Financial Summary:
# • Billable amount: $25,920
# • Budget utilization: 78% of weekly budget
# • Projected monthly: $110,377
```

## Report Types and Templates

### 1. Standard Billing Reports

#### Weekly Billing Report
```bash
# Generate weekly billing report
flowforge:billing:generate --week current --template standard

# Includes:
# - Executive summary
# - Developer time breakdown (privacy-protected)
# - Project/issue allocation
# - Billable vs non-billable analysis  
# - Budget tracking
# - Productivity metrics
```

#### Monthly Billing Report
```bash
# Generate comprehensive monthly report
flowforge:billing:generate --month current --template comprehensive

# Includes everything from weekly plus:
# - Monthly trend analysis
# - Sprint velocity metrics
# - Team capacity utilization
# - Client satisfaction indicators
# - ROI analysis
```

#### Custom Date Range
```bash
# Generate report for specific period
flowforge:billing:generate \
  --start-date "2025-09-01" \
  --end-date "2025-09-15" \
  --template detailed
```

### 2. Specialized Report Templates

#### Executive Summary Template
```bash
# High-level overview for C-level executives
flowforge:billing:generate --template executive --month current

# Executive Summary Content:
# - Financial overview (revenue, costs, ROI)
# - Team productivity metrics
# - Project milestone progress  
# - Risk indicators and alerts
# - Strategic recommendations
# - Competitive benchmarking
```

#### Client Invoice Template
```bash
# Invoice-ready report for client billing
flowforge:billing:generate \
  --template invoice \
  --client "ClientCorp" \
  --month current \
  --include-detailed-breakdown

# Invoice Template Features:
# - Professional formatting
# - Detailed line items by feature/issue
# - Time period breakdown
# - Payment terms integration
# - Tax calculation (if configured)
# - Digital signature support
```

#### Audit Trail Template
```bash
# Comprehensive audit trail for compliance
flowforge:billing:generate \
  --template audit \
  --quarter Q3-2025 \
  --include-all-metadata

# Audit Trail Includes:
# - Complete time tracking history
# - Data integrity checksums
# - Privacy compliance verification
# - System reliability metrics
# - Change log and approvals
# - Compliance certifications
```

### 3. Custom Template Creation

```bash
# Create custom billing template
flowforge:billing:template --create custom-template

# Template Builder Wizard:
# Template name: Custom Weekly Report
# Target audience: [internal|client|audit]: internal
# Frequency: [daily|weekly|monthly|quarterly]: weekly
# 
# Sections to include:
# [x] Executive summary
# [x] Team productivity
# [x] Project breakdown  
# [x] Budget analysis
# [ ] Individual developer details
# [x] Risk indicators
# 
# Visual elements:
# [x] Charts and graphs
# [x] Productivity trends
# [x] Budget utilization charts
# 
# Privacy level: [safe|detailed]: safe
# Output formats: [pdf|html|csv|json]: pdf,csv
# 
# Template saved: ~/.flowforge/templates/custom-weekly-report.json
```

## Understanding Billing Data

### Data Sources and Privacy Protection

```json
{
  "data_sources": {
    "individual_time_tracking": {
      "location": ".flowforge/user/{username}/time/",
      "privacy": "PRIVATE - Never shared",
      "content": [
        "Exact start/stop times",
        "Break durations and timing",
        "Productivity fluctuations",
        "Personal work patterns"
      ]
    },
    "team_aggregations": {
      "location": ".flowforge/team/summaries/", 
      "privacy": "SHARED - Privacy-preserved aggregates",
      "content": [
        "Daily billable hours totals",
        "Issue/project time allocation",
        "Team productivity averages",
        "Sprint velocity metrics"
      ]
    }
  }
}
```

### Billable vs Non-Billable Time

FlowForge automatically categorizes time as billable or non-billable:

```bash
# Configure billable time rules
flowforge:billing:configure --billable-rules

# Billable Time (Automatically Detected):
# ✅ Issue work (issues with client labels)
# ✅ Feature development 
# ✅ Bug fixes for client features
# ✅ Code review for billable features
# ✅ Testing billable functionality
# ✅ Client meetings and communication

# Non-Billable Time (Automatically Detected):
# ❌ Internal meetings
# ❌ Administrative tasks
# ❌ Professional development/learning
# ❌ Infrastructure work (unless client-specific)
# ❌ Recruiting and interviews
# ❌ General code refactoring

# Custom Rules:
flowforge:billing:rules --add-billable "client:ClientCorp"
flowforge:billing:rules --add-non-billable "label:internal"
```

### Time Accuracy and Validation

```bash
# Validate billing report accuracy
flowforge:billing:validate --month current

# Validation Report:
# =================
# 
# Data Integrity:
# ✅ All time entries have valid checksums
# ✅ No gaps in time tracking detected
# ✅ All aggregations mathematically consistent
# ✅ Privacy protection verified
# 
# Business Rule Validation:
# ✅ Billable categorization: 99.8% confidence
# ✅ Client allocation: 100% assigned
# ✅ Project budgets: Within configured limits
# ✅ Rate calculations: Verified against contracts
# 
# Audit Trail:
# ✅ Complete change log maintained
# ✅ All data modifications logged
# ✅ Privacy decisions documented
# ✅ System health events recorded
```

## Advanced Billing Features

### Multi-Client Billing

```bash
# Configure multiple clients
flowforge:billing:clients --configure

# Client Configuration:
# ====================
# 
# Client 1: ClientCorp
# Rate: $150/hour
# Currency: USD
# Issues: All with label "client:clientcorp"
# Contract: Time & Materials
# Budget: $50,000/month
# 
# Client 2: StartupInc  
# Rate: $120/hour
# Currency: USD
# Issues: Repository "startupinc/*"
# Contract: Fixed Price Sprint
# Budget: $30,000 total
# 
# Client 3: Internal
# Rate: $0/hour (internal projects)
# Issues: All with label "internal"

# Generate multi-client report
flowforge:billing:generate --all-clients --month current

# Multi-Client Summary:
# =====================
# Total Revenue: $43,200
# 
# ClientCorp: $28,800 (192 hours)
# - On track: 72% of monthly budget used
# - Projects: Authentication (68%), Migration (32%)
# 
# StartupInc: $14,400 (120 hours)  
# - Budget: $15,600 remaining of fixed contract
# - Projects: MVP Features (85%), Bug fixes (15%)
# 
# Internal: $0 (24 hours)
# - Projects: Team training, infrastructure
```

### Budget Tracking and Alerts

```bash
# Configure budget monitoring
flowforge:billing:budgets --configure

# Budget Alert Configuration:
# ===========================
# 
# ClientCorp Monthly Budget: $50,000
# Alert thresholds:
# • 75% used: Email to pm@company.com
# • 90% used: Email to ceo@company.com + Slack alert
# • 95% used: Block new billable work (safety mode)
# 
# StartupInc Project Budget: $45,000 total
# Alert thresholds:
# • 80% used: Email to startup-pm@company.com
# • 90% used: Schedule budget review meeting
# • 95% used: Require written approval for additional work

# Check current budget status
flowforge:billing:budgets --status

# Budget Status Report:
# =====================
# 
# ClientCorp (September 2025):
# 💰 Used: $36,200 / $50,000 (72%)
# 📈 Daily burn rate: $1,680 
# 📊 Projected month-end: $48,720 (97% - ⚠️ Alert threshold)
# 🎯 Status: On track but approaching limit
# 
# StartupInc (Total Project):
# 💰 Used: $29,400 / $45,000 (65%)
# 📈 Weekly burn rate: $3,600
# 📊 Projected completion: $42,300 (94%)
# 🎯 Status: Under budget, on schedule
```

### Automated Billing Workflows

```bash
# Set up automated weekly billing
flowforge:billing:automation --create weekly-client-reports

# Automation Configuration:
# =========================
# 
# Trigger: Every Friday at 5:00 PM
# Reports to generate:
# • Weekly summary for internal review
# • Client-specific invoices  
# • Budget status alerts
# 
# Distribution:
# • Internal team: Slack #billing channel
# • Accounting: billing-reports@company.com
# • Project managers: Automatic Notion updates
# 
# Approval workflow:
# • Auto-send if < $10,000 weekly
# • Require PM approval if $10,000-$25,000
# • Require executive approval if > $25,000

# Set up monthly client invoicing
flowforge:billing:automation --create monthly-invoicing

# Monthly Invoicing Workflow:
# ===========================
# 
# Trigger: 1st business day of each month
# Process:
# 1. Generate all client invoices
# 2. Validate against budget limits
# 3. Send to accounting for review
# 4. Auto-email to clients (after accounting approval)
# 5. Update CRM with billing data
# 6. Schedule payment follow-up reminders
```

## Report Analysis and Insights

### Productivity Analytics

```bash
# Generate team productivity insights
flowforge:billing:analytics --team-productivity --month current

# Team Productivity Analysis
# ==========================
# 
# 📊 Overall Metrics:
# • Team velocity: 87% (above 80% target)
# • Billable rate: 92% (above 90% target)
# • Code quality score: 4.2/5 (based on review cycles)
# • Client satisfaction: 94% (based on feedback)
# 
# 📈 Trends (vs last month):
# • Total hours: +8% (increased capacity)
# • Billable hours: +12% (improved efficiency)
# • Average task completion: +15% (faster delivery)
# • Context switching: -20% (better focus)
# 
# 🎯 Performance Insights:
# • Most productive day: Tuesday (avg 8.2 hours)
# • Optimal meeting times: 10-11am, 2-3pm
# • Peak coding hours: 9-11am, 2-4pm
# • Team collaboration score: 8.7/10
# 
# ⚠️ Attention Areas:
# • Friday productivity: 15% below average
# • Technical debt: Increasing 3% monthly
# • Meeting overhead: 18% of total time
```

### Project Profitability Analysis

```bash
# Analyze project profitability
flowforge:billing:analyze --profitability --all-projects

# Project Profitability Report
# ============================
# 
# 🏆 Most Profitable Projects:
# 
# 1. User Authentication System
#    • Revenue: $18,500
#    • Hours: 123.5
#    • Effective rate: $149.80/hour
#    • Margin: 95% (very high)
#    • Client satisfaction: 96%
# 
# 2. Database Migration
#    • Revenue: $12,600
#    • Hours: 84
#    • Effective rate: $150/hour
#    • Margin: 88% (high)
#    • Client satisfaction: 89%
# 
# ⚠️ Attention Needed:
# 
# 3. Legacy System Integration
#    • Revenue: $7,200
#    • Hours: 72
#    • Effective rate: $100/hour (below standard)
#    • Margin: 45% (low - lots of rework)
#    • Client satisfaction: 78%
#    
#    📋 Recommendations:
#    • Increase rate for legacy work (+$50/hour)
#    • Improve requirements gathering
#    • Add technical debt surcharge
```

### Competitive Benchmarking

```bash
# Compare against industry benchmarks
flowforge:billing:benchmark --industry "software-development" --team-size 4

# Industry Benchmarking Report
# ============================
# 
# 📊 Your Team vs Industry Average:
# 
# Billable Rate:
# • Your team: 92%
# • Industry average: 78%
# • Percentile: 85th (excellent)
# 
# Hourly Rates:
# • Your effective rate: $146/hour
# • Industry median: $125/hour
# • Premium: +17% (justified by quality)
# 
# Productivity Metrics:
# • Sprint velocity: 87% (80th percentile)
# • Code quality: 4.2/5 (75th percentile)
# • Client retention: 94% (90th percentile)
# 
# 🎯 Competitive Advantages:
# • Higher billable rate than 85% of competitors
# • Faster delivery (20% above average)
# • Better client satisfaction (15% above average)
# • Lower context switching overhead
# 
# 📈 Growth Opportunities:
# • Premium pricing justified by metrics
# • Market expansion potential in enterprise
# • Upselling opportunities in existing clients
```

## Report Customization and Branding

### Custom Report Layouts

```bash
# Create branded report template
flowforge:billing:branding --configure

# Brand Configuration:
# ===================
# 
# Company Information:
# • Name: Development Experts LLC
# • Logo: ./assets/company-logo.png
# • Address: 123 Tech Street, San Francisco, CA
# • Phone: +1 (555) 123-4567
# • Email: billing@devexperts.com
# 
# Brand Colors:
# • Primary: #0066CC (corporate blue)
# • Secondary: #FF6600 (accent orange)
# • Text: #333333 (dark gray)
# • Background: #FFFFFF (white)
# 
# Report Styling:
# • Font: Open Sans (professional)
# • Logo placement: Top left
# • Footer: Company confidential notice
# • Page numbering: Bottom right
```

### Client-Specific Customization

```bash
# Create client-specific report template
flowforge:billing:template --create clientcorp-invoice --client ClientCorp

# ClientCorp Specific Settings:
# =============================
# 
# Client Branding:
# • Include ClientCorp logo alongside company logo
# • Use ClientCorp's preferred color scheme (blue/gray)
# • Add ClientCorp project codes to line items
# 
# Required Information:
# • Purchase order numbers
# • Department cost center codes  
# • Detailed task descriptions
# • Manager approval signatures
# 
# Format Requirements:
# • PDF with digital signature
# • CSV export for their accounting system
# • Monthly summary dashboard link
```

### Interactive Reports

```bash
# Generate interactive HTML report
flowforge:billing:generate --format html --interactive --month current

# Interactive Features:
# • Clickable charts and graphs
# • Drill-down capability (team → individual projects)
# • Real-time data filtering
# • Export options (PDF, CSV, Excel)
# • Mobile-responsive design
# • Print-friendly version
# 
# Report URL: https://reports.flowforge.dev/team/dev-team/2025-09
# Access: Password protected, expires in 30 days
```

## Integration with Accounting Systems

### QuickBooks Integration

```bash
# Configure QuickBooks sync
flowforge:billing:integration --configure quickbooks

# QuickBooks Configuration:
# =========================
# 
# Connection: OAuth 2.0 (secure)
# Company: Development Experts LLC  
# Sync frequency: Weekly (every Friday)
# 
# Data Mapping:
# • FlowForge clients → QuickBooks customers
# • Time entries → Billable time items  
# • Rates → Service item pricing
# • Projects → QuickBooks jobs
# 
# Automatic Actions:
# • Create draft invoices
# • Update customer balances
# • Track payment status
# • Generate aging reports
```

### Custom ERP Integration

```bash
# Set up custom ERP integration
flowforge:billing:integration --configure custom-erp

# Custom ERP Setup:
# =================
# 
# API Endpoint: https://erp.company.com/api/v2
# Authentication: API key + OAuth
# Data Format: JSON REST API
# 
# Sync Fields:
# • Project codes
# • Cost center allocations
# • Employee billing rates
# • Client purchase orders
# • Budget approval workflows
# 
# Real-time Sync:
# • Time entries: Immediate
# • Invoices: Daily batch
# • Reports: Weekly
# • Budgets: Real-time updates
```

## Compliance and Audit Features

### SOX Compliance

```bash
# Generate SOX-compliant billing report
flowforge:billing:compliance --framework SOX --quarter Q3-2025

# SOX Compliance Report
# =====================
# 
# ✅ Internal Controls Verified:
# • Time tracking data immutable after 7 days
# • All changes logged with user attribution
# • Segregation of duties enforced (tracking ≠ billing)
# • Regular data backup and integrity checks
# 
# ✅ Financial Reporting Controls:
# • Revenue recognition rules applied consistently
# • Cut-off procedures for period-end
# • Supporting documentation maintained
# • Independent validation of billing calculations
# 
# ✅ Audit Trail Requirements:
# • Complete transaction history maintained
# • User access logs retained for 7 years
# • System security events monitored
# • Data retention policies enforced
```

### GDPR Compliance

```bash
# Verify GDPR compliance for billing data
flowforge:billing:compliance --framework GDPR --audit

# GDPR Compliance Audit
# =====================
# 
# ✅ Data Minimization:
# • Only billable hours shared (not detailed patterns)
# • Personal productivity metrics remain private
# • Automatic data anonymization after 2 years
# • Regular data purging of non-essential records
# 
# ✅ Consent Management:
# • Explicit consent for data processing
# • Granular consent for different data types
# • Easy consent withdrawal mechanism
# • Consent history tracked and auditable
# 
# ✅ Individual Rights:
# • Data export functionality available
# • Right to rectification supported
# • Right to erasure implemented
# • Data portability in standard formats
```

## Troubleshooting Billing Reports

### Common Issues and Solutions

#### Issue 1: Missing Billable Hours

**Symptoms**: Report shows lower hours than expected

```bash
# Diagnose missing hours
flowforge:billing:diagnose --missing-hours --week current

# Diagnosis Results:
# =================
# 
# 🔍 Potential Causes:
# • 12.5 hours marked as non-billable (internal tasks)
# • 3.2 hours in aggregation backlog (processing)
# • 1.8 hours from disabled user (alice on vacation)
# 
# 🔧 Recommended Actions:
# 1. Review billable categorization rules
# 2. Force aggregation processing: flowforge:time:aggregate --force
# 3. Exclude vacation days: flowforge:billing:generate --exclude-pto
```

**Solution**:
```bash
# Fix categorization rules
flowforge:billing:rules --review-and-fix

# Force complete aggregation  
flowforge:time:aggregate --force --comprehensive

# Regenerate report
flowforge:billing:generate --week current --recalculate
```

#### Issue 2: Privacy Violations in Report

**Symptoms**: Report contains private developer data

```bash
# Audit report for privacy compliance
flowforge:billing:privacy-audit --report billing-2025-W36.pdf

# Privacy Audit Results:
# ======================
# 
# ❌ Privacy Violations Found:
# • Exact start times visible on page 3
# • Individual break duration shown in summary
# • Productivity scores exposed for individual developers
# 
# 🔧 Remediation:
# • Regenerate with privacy-safe template
# • Update team privacy settings
# • Notify affected developers
```

**Solution**:
```bash
# Remove violating report
rm .flowforge/reports/billing/billing-2025-W36.pdf

# Regenerate with privacy protection
flowforge:billing:generate --week current --privacy-level safe

# Update default privacy settings
flowforge:billing:configure --default-privacy safe
```

## Best Practices

### Report Generation Best Practices

1. **Regular Schedule**: Generate reports on consistent schedule (weekly/monthly)
2. **Validation**: Always run validation before sending to clients
3. **Version Control**: Keep report templates in git for change tracking
4. **Backup**: Maintain copies of all generated reports
5. **Privacy**: Double-check privacy settings before external sharing

### Client Communication Best Practices

```bash
# Create client communication templates
flowforge:billing:communication --create-templates

# Email Templates Created:
# • Weekly status update
# • Monthly invoice delivery
# • Budget alert notifications
# • Project completion reports
# • Rate change notifications
```

### Audit Preparation

```bash
# Prepare for external audit
flowforge:billing:audit-prep --period 2025

# Audit Preparation Checklist:
# =============================
# 
# ✅ Data Integrity:
# • All time entries validated
# • Mathematical consistency verified
# • Supporting documentation compiled
# 
# ✅ Process Documentation:
# • Billing procedures documented
# • Internal controls described
# • Privacy policies updated
# 
# ✅ System Documentation:
# • Architecture decision records
# • Security assessment reports
# • Compliance certifications
# 
# 📁 Audit Package Created:
# • Location: .flowforge/audit/2025-annual/
# • Size: 245 MB
# • Files: 1,247 documents
# • Timespan: Full year 2025
```

## API Access for Custom Integration

### REST API Examples

```bash
# Get team billing summary via API
curl -H "Authorization: Bearer $FF_API_TOKEN" \
     "https://api.flowforge.dev/v2/billing/summary?period=current-week"

# Response:
{
  "team": "Development Team",
  "period": "2025-W36",
  "summary": {
    "total_hours": 187.5,
    "billable_hours": 172.8,
    "revenue": 25920.00,
    "billable_rate": 0.92
  },
  "projects": [
    {
      "issue_id": "456",
      "title": "User Authentication",
      "hours": 68.5,
      "revenue": 10275.00
    }
  ]
}
```

### Webhook Integration

```bash
# Configure billing webhook
flowforge:billing:webhook --configure

# Webhook Configuration:
# =====================
# 
# Trigger: Weekly report generation
# URL: https://company.com/webhooks/billing
# Format: JSON
# Authentication: HMAC-SHA256
# 
# Payload includes:
# • Report summary data
# • Download URL for full report
# • Budget status alerts
# • Team performance metrics
```

## Success Metrics

### Billing Report Quality Metrics

- **Accuracy**: 99.99% accuracy in time calculations
- **Speed**: Reports generated in < 5 seconds  
- **Privacy**: Zero privacy violations detected
- **Completeness**: 100% of billable time captured
- **Client Satisfaction**: > 95% approval rating

### Business Impact Metrics

- **Time Savings**: 95% reduction in billing preparation time
- **Revenue Protection**: Zero lost billable hours due to tracking failures
- **Client Trust**: 100% audit pass rate
- **Team Efficiency**: No developer workflow disruption
- **Compliance**: 100% regulatory compliance maintained

## Conclusion

FlowForge v2.0's Billing Reports system transforms the traditionally painful process of time tracking and billing into a streamlined, automated advantage. Teams get accurate financial data, clients receive transparent billing, and developers maintain their privacy and focus.

**Key Benefits**:
- **Instant Reports**: Generate professional billing reports in seconds
- **Perfect Accuracy**: 99.99% accuracy with complete audit trails  
- **Privacy Protection**: Detailed work patterns stay private
- **Compliance Ready**: SOX, GDPR, and audit-ready by default
- **Client Trust**: Transparent, verifiable billing builds stronger relationships

**Remember**: TIME = MONEY. FlowForge v2.0 ensures every minute is captured, categorized, and converted into accurate billing that drives business growth.

---
*FlowForge v2.0 Billing Reports Manual*  
*Version 1.0 - Complete billing system guide*  
*Generated: 2025-09-05*