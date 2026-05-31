# 🚀 GitHub Actions CI/CD Setup - Complete Guide

## Quick Start (5 minutes)

### Step 1: Verify Files Are In Place

```bash
ls -la .github/workflows/ci-cd.yml       # CI/CD workflow
ls -la CICD_SETUP.md                      # This guide
ls -la backend/.env.example               # Backend template
ls -la mobile/.env.example                # Mobile template
```

### Step 2: Add GitHub Secrets

**Go to:** GitHub Repository → **Settings** → **Secrets and variables** → **Actions**

Copy and paste these secrets with your actual values:

#### Backend Secrets:
```
Name: SUPABASE_URL
Value: https://gultpipdnkmkxlzsaott.supabase.co

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1.... (your full key)

Name: JWT_SECRET
Value: your-super-secret-key-min-32-characters

Name: RESEND_API_KEY
Value: re_... (your Resend API key)

Name: NOTIFY_EMAIL_TO
Value: admin@yourcompany.com

Name: TWILIO_ACCOUNT_SID
Value: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (optional)

Name: TWILIO_AUTH_TOKEN
Value: your_twilio_auth_token (optional)
```

#### Mobile Secrets:
```
Name: EXPO_PUBLIC_API_URL
Value: http://192.168.0.168:3000 (or your production domain)

Name: EXPO_PUBLIC_SUPABASE_URL
Value: https://gultpipdnkmkxlzsaott.supabase.co

Name: EXPO_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
```

### Step 3: Push Code to GitHub

```bash
git add .github/workflows/ci-cd.yml
git add .env.example
git add CICD_SETUP.md
git commit -m "Add CI/CD pipeline"
git push origin main
```

### Step 4: Monitor Pipeline

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Watch the workflow run ✅

---

## Detailed Setup Instructions

### What the CI/CD Pipeline Does

| Step | Action | What It Checks |
|------|--------|---|
| 1. Checkout | Clones your repository | Latest code |
| 2. Setup | Configures Node.js environment | Version 20 |
| 3. Create .env | Builds .env from GitHub secrets | No hardcoded secrets |
| 4. Install | Runs `npm ci` | All dependencies |
| 5. Type Check | Runs TypeScript validation | No type errors |
| 6. Build | Builds production code | Compiles successfully |
| 7. Test | Runs test suite | All tests pass |
| 8. Quality | Checks code quality | No secrets in code |
| 9. Summary | Reports final status | Overall success/failure |

### Pipeline Execution Flow

```
┌─────────────────────┐
│   Code Pushed       │
│ (main/develop)      │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
  Backend     Mobile
  (parallel)  (parallel)
    │             │
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │ Integration     │ (only if both pass)
    │ Tests           │
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ Code Quality    │
    │ Checks          │
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ Summary &       │
    │ Deploy (main)   │
    └─────────────────┘
```

---

## How to Add Secrets (Detailed Steps)

### Method 1: GitHub Web UI (Easiest)

1. Open your repository on GitHub.com
2. Go to **⚙️ Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **"New repository secret"** (green button)
5. Enter secret details:
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://gultpipdnkmkxlzsaott.supabase.co`
6. Click **Add secret**
7. Repeat for all required secrets

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh

# Authenticate
gh auth login

# Add secrets
gh secret set SUPABASE_URL --body "https://gultpipdnkmkxlzsaott.supabase.co"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your_service_key"
gh secret set JWT_SECRET --body "your_jwt_secret"
gh secret set RESEND_API_KEY --body "your_resend_key"
gh secret set NOTIFY_EMAIL_TO --body "admin@example.com"
gh secret set EXPO_PUBLIC_API_URL --body "http://192.168.0.168:3000"
gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://gultpipdnkmkxlzsaott.supabase.co"
gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "your_anon_key"

# Optional Twilio
gh secret set TWILIO_ACCOUNT_SID --body "your_account_sid"
gh secret set TWILIO_AUTH_TOKEN --body "your_auth_token"
```

### Method 3: Verify Secrets Were Added

```bash
# List all secrets (doesn't show values)
gh secret list
```

---

## Running the Pipeline

### Automatic Triggers

Pipeline runs automatically on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ Pull requests to `main` or `develop`

### Manual Trigger (Advanced)

In GitHub UI:
1. Go to **Actions**
2. Select workflow on left
3. Click **"Run workflow"** button

---

## Understanding the Output

### Successful Pipeline ✅

```
✅ Backend build successful
✅ Mobile build successful
✅ Integration tests completed
✅ Code quality verified
🎉 All checks passed successfully!
```

### Failed Pipeline ❌

If any job fails, you'll see:
```
❌ Backend build failed
❌ Check the logs below for details
```

Click the failed job to see detailed error logs.

---

## Troubleshooting

### Problem: "Missing secrets"

**Solution**: Go to Settings → Secrets and add all required secrets

### Problem: "TypeError: Cannot read property 'X' of undefined"

**Solution**: A required secret is missing. Check CICD_SETUP.md for all required secrets.

### Problem: "npm ERR! code E404"

**Solution**: 
- Check `package.json` dependencies
- Verify package names are spelled correctly
- Run locally: `npm ci` to verify

### Problem: "TypeScript compilation failed"

**Solution**:
- Run locally: `npx tsc --noEmit`
- Fix any type errors in your code
- Push the fix

### Problem: Tests timeout

**Solution**:
- Increase timeout in workflow: change `timeout-minutes: 15` to higher value
- Optimize slow tests locally first
- Mock external API calls in tests

### Problem: Workflow not triggering

**Solution**:
- Check branch protection rules
- Verify `.github/workflows/ci-cd.yml` is in `main` branch
- Use GitHub CLI: `gh workflow list`

---

## Environment Variables Reference

### Available in Workflow

```yaml
github.ref              # Branch name (refs/heads/main)
github.sha              # Commit SHA
github.event_name       # Trigger type (push, pull_request)
runner.os              # Operating system (ubuntu-latest)
```

### Accessing Secrets in Jobs

```yaml
${{ secrets.SUPABASE_URL }}
${{ secrets.JWT_SECRET }}
# etc.
```

---

## Advanced Configuration

### Run Tests Only on Specific Branches

```yaml
on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
```

### Skip CI on Certain Commits

```bash
git commit -m "Fix typo [skip ci]"
```

### Matrix Testing (Multiple Node Versions)

Already configured in `ci-cd.yml`:
```yaml
strategy:
  matrix:
    node-version: [18, 20]
```

---

## Monitoring & Notifications

GitHub automatically:
- ✅ Shows CI status on PRs
- ✅ Blocks merging if CI fails (with branch protection)
- ✅ Emails on failures
- ✅ Shows build badge in README

### Add Build Badge to README

```markdown
![CI/CD Pipeline](https://github.com/your-username/your-repo/workflows/CI%2FCD%20Pipeline/badge.svg)
```

---

## Security Best Practices

✅ **DO:**
- Use GitHub Secrets for all sensitive data
- Never commit `.env` files
- Rotate API keys regularly
- Use branch protection rules

❌ **DON'T:**
- Hardcode secrets in `.yml` files
- Log secrets in workflow output
- Use same secrets for dev/prod
- Commit `.env` files

---

## Maintenance

### Weekly Checks
- [ ] Verify all secrets are still valid
- [ ] Check for dependency updates
- [ ] Review failed builds

### Monthly Checks
- [ ] Rotate API keys
- [ ] Update Node.js version if needed
- [ ] Review GitHub Actions updates

---

## Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Commit and push files
3. ✅ Monitor first build in Actions tab
4. ✅ Fix any issues reported
5. ✅ Set up branch protection rules

---

## Support

For issues:
1. Check workflow logs: GitHub → Actions → [workflow] → [job] → scroll down
2. Run tests locally: `npm test`
3. Verify `.env.example` format matches your `.env`
4. Check GitHub Status: https://www.githubstatus.com

---

**Your CI/CD pipeline is now production-ready!** 🚀
