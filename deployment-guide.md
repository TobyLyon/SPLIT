# 📱 Mobile Development & Viewing Guide for SplitSquads

## 🌐 **Option 1: Deploy to Vercel (Fastest Preview)**

### Quick Deploy Steps:
1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial SplitSquads implementation"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the `app` folder as the root
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
     NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
     NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
     ```
   - Deploy and get your live URL!

## 🔧 **Option 2: Use CodeSandbox/StackBlitz**

### CodeSandbox Setup:
1. **Create new Next.js project on [codesandbox.io](https://codesandbox.io)**
2. **Upload your files:**
   - Copy contents from `/workspace/app/` 
   - Upload to CodeSandbox
3. **Install dependencies:**
   ```json
   {
     "dependencies": {
       "@solana/wallet-adapter-base": "^0.9.23",
       "@solana/wallet-adapter-react": "^0.15.35",
       "@solana/wallet-adapter-react-ui": "^0.9.35",
       "@solana/wallet-adapter-wallets": "^0.19.32",
       "@solana/web3.js": "^1.95.3",
       "@supabase/supabase-js": "^2.39.0",
       "framer-motion": "^11.0.3",
       "lucide-react": "^0.321.0",
       "next": "14.1.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0"
     }
   }
   ```
4. **Get instant preview URL**

## 📱 **Option 3: Mobile-Friendly Development Setup**

### Using Gitpod (Cloud IDE):
1. **Create `.gitpod.yml` in root:**
   ```yaml
   tasks:
     - name: Setup Environment
       init: |
         cd app
         npm install
         npm run build
     - name: Start Development Server
       command: |
         cd app
         npm run dev
   ports:
     - port: 3000
       onOpen: open-browser
       visibility: public
   ```

2. **Access via browser:**
   - Visit `https://gitpod.io/#https://github.com/your-repo`
   - Get public URL for mobile testing

## 🌍 **Option 4: Tunnel Local Development**

### Using ngrok (if you can run locally):
```bash
# In terminal 1
cd app
npm run dev

# In terminal 2
npx ngrok http 3000
```
- Get public URL: `https://abc123.ngrok.io`
- Access from any device

## 📋 **Quick Mobile Testing Checklist**

### Essential Mobile Tests:
- [ ] **Responsive Design**: Check all breakpoints
- [ ] **Touch Interactions**: Buttons, swipes, taps
- [ ] **Wallet Connection**: Test on mobile wallets
- [ ] **Performance**: Loading times on mobile
- [ ] **Accessibility**: Screen reader compatibility

### Mobile-Specific Features to Test:
- [ ] **Glassmorphic Effects**: Do they work on mobile browsers?
- [ ] **Animations**: Smooth 60fps performance
- [ ] **Wallet Adapter**: Mobile wallet integration
- [ ] **Touch Gestures**: Swipe, pinch, scroll

## 🔗 **Recommended Mobile Testing Tools**

### Browser DevTools:
- Chrome DevTools mobile simulation
- Firefox Responsive Design Mode
- Safari Web Inspector

### Real Device Testing:
- **iOS**: Safari, Chrome, Phantom Wallet app
- **Android**: Chrome, Firefox, Phantom Wallet app
- **Cross-platform**: Brave, Opera

## ⚡ **Quick Start Commands**

### If you have Node.js access:
```bash
# Navigate to app directory
cd /workspace/app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables Needed:
```bash
# Create .env.local in app directory
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## 🎯 **Recommended Workflow for Mobile Development**

1. **Deploy to Vercel** for quick previews
2. **Use CodeSandbox** for rapid iteration
3. **Test on real devices** for final validation
4. **Use browser DevTools** for debugging

## 📱 **Mobile-Specific Considerations**

### Performance Optimizations:
- Lazy load images and components
- Minimize bundle size
- Optimize for slower networks
- Use service workers for caching

### UX Considerations:
- Larger touch targets (44px minimum)
- Readable text sizes (16px minimum)
- Proper contrast ratios
- Accessible navigation

### Wallet Integration:
- Test with Phantom mobile app
- Test with Solflare mobile app
- Ensure proper deep linking
- Handle connection errors gracefully

## 🔍 **Debugging Mobile Issues**

### Common Mobile Problems:
1. **Viewport Issues**: Add proper meta tags
2. **Touch Events**: Use touch-friendly interactions
3. **Performance**: Optimize animations and images
4. **Wallet Connection**: Test with actual mobile wallets

### Debug Tools:
- Remote debugging with Chrome DevTools
- Safari Web Inspector for iOS
- Console logging for mobile browsers
- Network tab for performance issues