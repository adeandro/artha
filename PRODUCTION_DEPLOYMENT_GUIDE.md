# 🎯 PRODUCTION DEPLOYMENT GUIDE

## Pre-Release Checklist (48 Hours Before)

### Environment Setup
```bash
# Verify Node.js version
node --version  # Should be 18.17.0 or higher

# Update EAS CLI
npm update -g eas-cli

# Verify authentication
eas login
# Confirm: You should see your EAS account email
```

### Code Verification
```bash
cd /c/development/Artha

# Final lint check
npm run lint
# Expected: ✅ 0 errors, 0 warnings

# Clean install (optional, for clean build)
rm -rf node_modules
npm ci
```

### Version & Changelog
- ✅ Version in `app.json`: **1.0.0**
- ✅ Version in `package.json`: **1.0.0**
- ✅ EAS Project ID: **acef04c8-4a9a-4785-8e21-560d1db00fb0**

---

## iOS Build & Release

### Step 1: Build on EAS
```bash
# Command
eas build --platform ios --profile production

# Process:
# 1. EAS compiles your code on Apple servers
# 2. Creates .ipa file
# 3. Provides download link
# Estimated time: 10-15 minutes
```

### Step 2: Download & Test
```bash
# You'll receive download link via email
# Download the .ipa file
# Install on iOS device/simulator via Xcode:
# xcode-select --install
# (Then drag .ipa to Xcode device list)
```

### Step 3: Manual Testing (30 mins)
- [ ] Fresh install → Shows PIN setup screen
- [ ] Create PIN (6 digits) → Auto-login to dashboard
- [ ] Close app → Reopen → Shows login screen
- [ ] Enter PIN → Dashboard loads
- [ ] Toggle biometric in Settings → Works
- [ ] Add transaction → Appears in history
- [ ] Edit transaction → Changes apply
- [ ] Delete transaction → Removed from list
- [ ] Add category → Shows in dropdown
- [ ] Set budget → Display updates
- [ ] Export to Excel → File created + share dialog
- [ ] Change PIN → Old PIN doesn't work, new PIN works

### Step 4: Submit to TestFlight
```bash
# Install Apple Transporter
# Sign in with Apple ID
# Upload .ipa → TestFlight
# Add internal testers
# Request feedback for 48 hours
```

### Step 5: Submit to App Store
```bash
# Once TestFlight passes internal testing:
# 1. Add screenshots (5-7 per iPhone size)
# 2. Add app description & keywords
# 3. Set pricing (free or paid)
# 4. Select rating (it's finance app, 4+)
# 5. Click "Submit for Review"
# 6. Wait for Apple review (48-72 hours)
```

---

## Android Build & Release

### Step 1: Build on EAS
```bash
# Command
eas build --platform android --profile production

# Process:
# 1. EAS compiles APK on Android servers
# 2. Creates .aab file (App Bundle for Play Store)
# 3. Provides download link
# Estimated time: 5-10 minutes
```

### Step 2: Download & Test
```bash
# You'll receive download link via email
# Download the .aab file
# For local testing, convert to APK:
# bundletool build-apks --bundle=app.aab \
#   --output=app.apks --ks=key.jks \
#   --ks-pass=pass:PASSWORD
```

### Step 3: Manual Testing (30 mins)
- [ ] Fresh install → Shows PIN setup screen
- [ ] Create PIN (6 digits) → Auto-login to dashboard
- [ ] Close app → Reopen → Shows login screen
- [ ] Enter PIN → Dashboard loads
- [ ] Test fingerprint in Settings → Works
- [ ] Add transaction → Appears in history
- [ ] Edit transaction → Changes apply
- [ ] Delete transaction → Removed from list
- [ ] Add category → Shows in dropdown
- [ ] Set budget → Display updates
- [ ] Export to Excel → File created + share dialog
- [ ] Change PIN → Old PIN doesn't work, new PIN works

### Step 4: Submit to Google Play
```bash
# Go to Google Play Console
# 1. Create app → "Artha"
# 2. Set app type → Applications
# 3. Fill app details (description, keywords, screenshots)
# 4. Upload .aab file to Internal Testing
# 5. Add test users, test for 48 hours
# 6. Upload to Production release
# 7. Set price if needed
# 8. Fill content rating questionnaire
# 9. Click "Review and roll out to Production"
# 10. Wait for Google review (24-48 hours)
```

---

## Web Deployment (Optional)

### Build & Deploy
```bash
# Build static site
npm run web

# Output directory: dist/

# Options:
# Option A: Netlify
# - Connect GitHub repo to Netlify
# - Auto-deploy on commits to main
# - Custom domain setup

# Option B: Vercel
# - npm i -g vercel
# - vercel

# Option C: GitHub Pages
# - npm run web
# - Push dist/ to gh-pages branch
# - Set repository settings → Pages
```

---

## Post-Release Operations

### Day 1-7: Monitor
```
✅ Crash Reports (via Sentry or Play Console)
✅ Performance Metrics (startup time, memory)
✅ User Feedback (Play Store / App Store reviews)
✅ Error Logs (check for runtime exceptions)
```

### Day 7-30: Collect Feedback
- [ ] Read ALL 5-star reviews → Feature requests?
- [ ] Read 3-4 star reviews → Bug reports?
- [ ] Monitor crash rate (target < 0.1%)
- [ ] Track app ratings (target 4.5+)
- [ ] Respond to negative reviews with fixes

### Bug Fix Release Cycle
```
1. Identify bug from user reports
2. Create git branch: git checkout -b bugfix/issue-name
3. Fix code
4. Test locally: npm run android / npm run ios
5. Bump version: app.json, package.json
6. Commit: git commit -m "Fix: description"
7. Build: eas build --platform ios
8. Repeat for Android
9. Submit to stores
10. Announce in App Store notes
```

---

## Troubleshooting Common Issues

### Issue: Build Fails with "Module not found"
```
Solution:
1. npm ci (clean install)
2. eas build --platform ios --profile production --clear-cache
```

### Issue: App Crashes on Startup
```
Solution:
1. Check console logs in TestFlight (iOS) or Play Console (Android)
2. Review recent code changes
3. Test on physical device (simulator may differ)
4. Check AsyncStorage key naming
```

### Issue: Biometric Not Working
```
Solution:
1. Ensure device has fingerprint/Face ID enrolled
2. Check settings toggle is ON
3. Verify permission granted in Settings
4. Test manual PIN entry as fallback
```

### Issue: Data Not Persisting
```
Solution:
1. Check AsyncStorage keys match (artha_*)
2. Verify not running in development/expo-go
3. Clear app storage: Settings → App → Storage → Clear
4. Reinitialize PIN to trigger fresh load
```

### Issue: Excel Export Not Working
```
Solution:
1. Check file storage permissions
2. Verify file name doesn't contain special chars
3. Test on physical device (works differently than simulator)
4. Check available storage space
```

---

## Production Monitoring Dashboard

### Metrics to Track
```
Daily:
- Crash rate (target: < 0.1%)
- Active users
- Session length (target: > 2 mins)
- Feature usage (transactions added, categories, budgets)

Weekly:
- Feature adoption (% users using each feature)
- Error logs (errors per session)
- Performance (startup time, list scroll FPS)
- User retention (target: 50% Day 7)

Monthly:
- App rating trend
- Review sentiment analysis
- Feature request trends
- Competitive analysis
```

### Tools to Use
```
iOS:
- TestFlight crash reports
- App Store Connect Analytics
- Xcode organizer

Android:
- Google Play Console crash reports
- Firebase Crashlytics (optional)
- Google Analytics (optional)

Optional Infrastructure:
- Sentry.io (error tracking)
- Amplitude (analytics)
- branch.io (deep linking)
```

---

## Release Notes Template

```
📱 Artha v1.0.0 - Welcome! 🎉

We're excited to introduce Artha, your personal finance companion.

✨ Features:
🔐 Secure PIN & Biometric Authentication
📊 Monthly Income/Expense Dashboard
📝 Unlimited Transaction Entry & History
📂 Custom Categories for Income & Expenses
💼 Monthly Budget Limits & Alerts
📤 Export Transaction Data to Excel
💾 All Data Stored Locally (Offline Support)
🌍 Bahasa Indonesia Interface
📱 Works on iPhone, Android, & Web

💡 Getting Started:
1. Launch Artha
2. Create your 6-digit PIN
3. Add your first transaction
4. Track your finances securely

🛡️ Security:
- PIN-protected access
- Biometric authentication (Face ID / Fingerprint)
- All data stored locally on your device
- No cloud sync or external servers

📧 Feedback:
Love Artha? Leave a review!
Found a bug? Email support@artha.local

Thank you for choosing Artha!
```

---

## Emergency Rollback Plan

### If Critical Bug Discovered
```bash
1. STOP: Don't submit more builds

2. ASSESS: Determine severity
   - Crash on startup? CRITICAL
   - Data loss? CRITICAL
   - Feature broken? MAJOR
   - Display glitch? MINOR

3. ROLLBACK: Revert to previous version
   git revert HEAD
   git push origin rollback-branch

4. BUILD: Release new version
   # Bump version: 1.0.1
   eas build --platform ios
   eas build --platform android

5. NOTIFY: Inform users
   - Apology in release notes
   - Explain fix
   - Thank for reporting

6. POSTMORTEM: Prevent recurrence
   - Add test case for bug
   - Update code review checklist
   - Document in ISSUES.md
```

---

## Success Criteria

### Launch Success (Immediate)
- ✅ 0 crashes in first 100 downloads
- ✅ 4.5+ rating in first week
- ✅ 100+ users in first month

### Growth Goals (3 Months)
- ✅ 1000+ users
- ✅ 4.8+ rating
- ✅ < 0.1% crash rate
- ✅ 50% user retention (Day 30)

### Expansion Plans (6 Months)
- [ ] Add recurring transactions
- [ ] Add budget notifications
- [ ] Add spending trends chart
- [ ] Multiuser support (family sharing)
- [ ] Cloud backup (optional)

---

**Status**: ✅ READY FOR PRODUCTION RELEASE  
**Last Updated**: 2026-02-18  
**Next Steps**: Execute iOS build, TestFlight, App Store submission

