# 🚀 Production Deployment Guide for SplitSquads

## 📋 Pre-Deployment Checklist

### ✅ **Environment Setup**
- [ ] Supabase project created and configured
- [ ] Solana program deployed to devnet/mainnet
- [ ] Environment variables configured
- [ ] Domain name configured (optional)
- [ ] SSL certificates (handled by Vercel)

### ✅ **Required Environment Variables**

#### **App Environment (.env.local):**
```bash
# Solana Configuration
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=your-deployed-program-id
NEXT_PUBLIC_SPLIT_TOKEN_MINT=your-split-token-mint-address
NEXT_PUBLIC_CLUSTER=mainnet-beta

# App Configuration  
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ORACLE_PUBLIC_KEY=your-oracle-public-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Security
BACKGROUND_JOB_API_KEY=your-secure-random-api-key
ORACLE_PRIVATE_KEY=your-oracle-private-key-base64
```

## 🏗 **Deployment Steps**

### **Step 1: Deploy Solana Program**
```bash
# Build and deploy to mainnet
cd programs/splitsquads
anchor build
anchor deploy --provider.cluster mainnet

# Get your program ID
solana address -k target/deploy/splitsquads-keypair.json

# Update IDL
anchor idl init --filepath target/idl/splitsquads.json YOUR_PROGRAM_ID --provider.cluster mainnet
```

### **Step 2: Setup Supabase Database**
1. **Create Supabase Project**: Visit [supabase.com](https://supabase.com)
2. **Run Database Schema**: Copy SQL from `/infra/supabase/schema.sql`
3. **Configure Storage**: Enable file uploads for avatars/banners
4. **Get Connection Details**: Copy URL and keys to environment

### **Step 3: Deploy Frontend to Vercel**
```bash
# Option A: Manual Deploy
cd app
vercel --prod

# Option B: GitHub Integration
# 1. Push code to GitHub
# 2. Connect repository to Vercel
# 3. Configure environment variables
# 4. Deploy automatically
```

### **Step 4: Configure Environment Variables in Vercel**
1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Add all variables from `.env.local.example`
3. Set production values for mainnet deployment

### **Step 5: Test Production Deployment**
```bash
# Test all functionality:
# - Wallet connection
# - Squad creation
# - Joining squads  
# - Staking/unstaking
# - Leaderboard updates
# - Twitter verification
```

## 🔧 **Configuration Files**

### **vercel.json** (Production Config)
```json
{
  "version": 2,
  "name": "splitsquads",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_RPC_ENDPOINT": "https://api.mainnet-beta.solana.com"
  },
  "functions": {
    "pages/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🚀 **One-Click Deployment Commands**

### **Development Deployment**
```bash
# Deploy to devnet
./scripts/deploy.sh --network devnet

# Access at: https://your-app.vercel.app
```

### **Production Deployment**
```bash
# Deploy to mainnet  
./scripts/deploy.sh --network mainnet

# Access at: https://your-domain.com
```

## 📱 **Mobile Testing Checklist**

### **Essential Tests:**
- [ ] **Wallet Connection**: Test with Phantom, Solflare mobile apps
- [ ] **Responsive Design**: All breakpoints work correctly
- [ ] **Touch Interactions**: Buttons, modals, forms work on touch
- [ ] **Performance**: 60fps animations, fast loading
- [ ] **Offline Handling**: Graceful degradation without connection

### **Cross-Platform Testing:**
- [ ] **iOS Safari**: Webkit compatibility
- [ ] **Chrome Mobile**: Android compatibility  
- [ ] **Phantom Mobile**: In-app browser
- [ ] **Solflare Mobile**: In-app browser
- [ ] **Desktop**: Chrome, Firefox, Safari, Edge

## 🔒 **Security Considerations**

### **Smart Contract Security:**
- ✅ Proper PDA derivation and validation
- ✅ Signer verification on all instructions
- ✅ Overflow/underflow protection
- ✅ Access control for oracle updates
- ✅ Safe math operations

### **Frontend Security:**
- ✅ Input validation with Zod schemas
- ✅ XSS protection with proper escaping
- ✅ CSRF protection with SameSite cookies
- ✅ Rate limiting on API endpoints
- ✅ Secure headers configuration

### **API Security:**
- ✅ Authentication for sensitive endpoints
- ✅ Input validation and sanitization
- ✅ Rate limiting and DDoS protection
- ✅ Secure oracle signature verification
- ✅ Environment variable protection

## 📊 **Monitoring & Analytics**

### **Recommended Monitoring:**
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Logs**: Database query monitoring  
- **Solana Explorer**: Transaction monitoring
- **Custom Dashboards**: User activity tracking

### **Key Metrics to Track:**
- Daily/Monthly Active Users
- Squad creation rate
- Staking volume
- Reward distribution frequency
- Transaction success rates
- Page load performance

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Wallet Connection Fails**: Check RPC endpoint and network
2. **Transactions Fail**: Verify program deployment and accounts
3. **Data Not Loading**: Check Supabase configuration and API routes
4. **Mobile Issues**: Test with actual device browsers
5. **Performance Problems**: Check bundle size and optimization

### **Debug Tools:**
- Browser DevTools Network tab
- Vercel Function logs  
- Supabase Dashboard logs
- Solana Explorer transaction details

## 🎯 **Go-Live Checklist**

- [ ] **Program deployed** to mainnet with verified build
- [ ] **Frontend deployed** to production domain
- [ ] **Database configured** with proper security policies
- [ ] **Environment variables** set for production
- [ ] **SSL certificate** active and valid
- [ ] **Mobile testing** completed across devices
- [ ] **Performance testing** under load
- [ ] **Security audit** completed
- [ ] **Monitoring** and alerting configured
- [ ] **Documentation** updated with production details

## 🌟 **Post-Launch**

### **Immediate Tasks:**
1. Monitor transaction success rates
2. Track user onboarding flow
3. Gather user feedback
4. Monitor performance metrics
5. Plan feature roadmap

### **Growth Strategies:**
1. Community building on Discord/Twitter
2. Partnerships with other Solana projects
3. Incentive programs for early adopters
4. Content marketing and tutorials
5. Integration with other DeFi protocols

---

**Ready to go live! 🚀**