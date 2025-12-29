# Deploying CalOohPay Web to Vercel

This guide walks you through deploying CalOohPay Web to Vercel's free tier, which is perfect for early-stage applications.

## Why Vercel?

- **Free tier**: 100GB bandwidth, unlimited requests, serverless functions included
- **Zero configuration**: Optimized for Next.js out of the box
- **Built-in DDoS protection**: No additional setup required
- **Global CDN**: Fast loading worldwide
- **Automatic HTTPS**: SSL certificates included
- **Cost**: $0/month for hobby projects, $20/month total when you need Pro features

## Prerequisites

1. [Vercel account](https://vercel.com/signup) (free)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. PagerDuty OAuth app configured (see [docs/setup/pagerduty-oauth-setup.md](../setup/pagerduty-oauth-setup.md))

## Quick Deploy (Recommended)

### Option 1: Deploy via GitHub Integration

1. **Push your code to GitHub** (if not already done):

   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `caloohpay-web` repository
   - Click "Import"

3. **Configure environment variables** (see [Environment Variables](#environment-variables) section below)

4. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? caloohpay-web
# - In which directory is your code located? ./
# - Override settings? No
```

## Environment Variables

Configure these in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables

```bash
# PagerDuty OAuth (Production)
NEXT_PUBLIC_PAGERDUTY_CLIENT_ID=your_pagerduty_client_id
PAGERDUTY_CLIENT_SECRET=your_pagerduty_client_secret

# NextAuth (CRITICAL - Generate new secret!)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-project.vercel.app

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=CalOohPay Web
```

### Optional Variables (with defaults)

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_CSV_EXPORT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# API Configuration
API_TIMEOUT=30000
```

### Generating NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

⚠️ **IMPORTANT**: Never reuse your local development `NEXTAUTH_SECRET` in production!

## PagerDuty OAuth Configuration

Update your PagerDuty OAuth app redirect URI to include your Vercel domain:

1. Go to [PagerDuty OAuth Apps](https://yoursubdomain.pagerduty.com/developer/applications)
2. Edit your OAuth app
3. Add redirect URI: `https://your-project.vercel.app/api/auth/callback`
4. Save changes

## Post-Deployment

### 1. Test Authentication

Visit `https://your-project.vercel.app/login` and verify:

- ✅ OAuth login redirects to PagerDuty
- ✅ API Token login works
- ✅ Authentication persists across page refreshes

### 2. Test Core Features

- ✅ Schedules list loads
- ✅ Schedule detail page shows calendar/list views
- ✅ Payment calculations are correct
- ✅ CSV export downloads

### 3. Monitor Performance

Vercel Dashboard → Your Project → Analytics:

- Response times
- Error rates
- Bandwidth usage
- Function invocations

## Custom Domain (Optional)

### Free Vercel Subdomain

Your app is automatically available at:

- `https://your-project.vercel.app`
- `https://your-project-git-main.vercel.app` (main branch)

### Custom Domain ($10-15/year via Vercel Domains or any registrar)

1. **Add domain in Vercel**:
   - Dashboard → Project → Settings → Domains
   - Add your domain (e.g., `caloohpay.com`)

2. **Update DNS** (if using external registrar):

   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **Update environment variables**:

   ```bash
   NEXTAUTH_URL=https://caloohpay.com
   NEXT_PUBLIC_APP_URL=https://caloohpay.com
   ```

4. **Update PagerDuty OAuth redirect URI**:
   ```
   https://caloohpay.com/api/auth/callback
   ```

## Continuous Deployment

Every push to `main` branch automatically triggers a new deployment:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
# Vercel automatically deploys in 1-2 minutes
```

### Preview Deployments

Every pull request gets its own preview URL:

- Create PR → Vercel comment appears with preview link
- Test changes before merging
- Preview URLs: `https://your-project-git-branch.vercel.app`

## Cost Management

### Free Tier Limits (Hobby)

- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ 100 hours serverless function execution/month
- ✅ 6,000 minutes build time/month
- ✅ 1 concurrent build

**Typical usage for 50 active users**: ~10-20GB bandwidth/month = **$0/month**

### When to Upgrade to Pro ($20/month)

- Need custom domains with more than 1 project
- Need team collaboration features
- Exceed free tier bandwidth (>100GB/month)
- Need faster builds or more concurrent builds

### Bandwidth Optimization Tips

1. **Enable Next.js image optimization** (already configured)
2. **Use SVGs instead of PNGs** for icons
3. **Minimize bundle size**: Run `npm run build` to check bundle size
4. **Cache API responses**: Use SWR's built-in caching

## Monitoring & Alerts

### Built-in Monitoring (Free)

- Vercel Dashboard → Analytics
- Real-time logs: Dashboard → Deployments → Select deployment → Runtime Logs

### Cost Alerts

1. Dashboard → Account Settings → Usage
2. Set bandwidth alert at 80GB (80% of free tier)
3. Get email notification before hitting limit

### Error Monitoring (Optional)

Free tier integrations:

- [Sentry](https://sentry.io) (5K errors/month free)
- [LogRocket](https://logrocket.com) (1K sessions/month free)

## Troubleshooting

### Build Failures

**Error**: "Module not found"

```bash
# Solution: Clear cache and redeploy
vercel --force
```

**Error**: "Environment variable not found"

```bash
# Solution: Check Vercel Dashboard → Settings → Environment Variables
# Ensure all required variables are set for Production environment
```

### Authentication Issues

**Error**: "Invalid callback URL"

```bash
# Solution: Update PagerDuty OAuth app redirect URI
# Must exactly match: https://your-project.vercel.app/api/auth/callback
```

**Error**: "Session expires immediately"

```bash
# Solution: Generate new NEXTAUTH_SECRET
openssl rand -base64 32
# Add to Vercel environment variables
# Redeploy
```

### Performance Issues

**Slow API responses**:

- Check PagerDuty API rate limits (960 req/min)
- Verify API_TIMEOUT is set (default: 30000ms)
- Use SWR caching to reduce API calls

## Rollback

If a deployment breaks production:

```bash
# Via Dashboard
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "..." menu → Promote to Production

# Via CLI
vercel rollback
```

## Security Best Practices

- ✅ Use environment variables for all secrets (never commit `.env` files)
- ✅ Generate unique `NEXTAUTH_SECRET` for production
- ✅ Enable Vercel's password protection for staging environments
- ✅ Use custom domain with HTTPS (automatic with Vercel)
- ✅ Review Vercel security headers (configured in `vercel.json`)

## Next Steps

1. **Monitor usage**: Check Vercel Dashboard weekly for first month
2. **Set up analytics**: Optional but recommended for understanding user behavior
3. **Configure alerts**: Bandwidth alerts at 80GB to avoid surprises
4. **Plan scaling**: When you hit 100 users, evaluate Pro tier ($20/month)

## Cost Projection

| Users | Bandwidth | Vercel Cost | Cost/User |
| ----- | --------- | ----------- | --------- |
| 10    | ~5GB      | $0          | $0        |
| 50    | ~20GB     | $0          | $0        |
| 100   | ~40GB     | $0          | $0        |
| 200   | ~80GB     | $0          | $0        |
| 500   | ~150GB    | $20 (Pro)   | $0.04     |
| 1000  | ~300GB    | $20 (Pro)   | $0.02     |

**Reality check**: At $1-2/month per user pricing:

- 100 users = $100-200/month revenue
- Infrastructure cost = $0-20/month
- **Margin = 90-100%** 🎉

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Additional Resources

- [PagerDuty OAuth Setup](../setup/pagerduty-oauth-setup.md)
- [API Token Authentication](../setup/api-token-auth.md)
- [Architecture Overview](../architecture.md)
