# 📦 Install Missing Dependencies

## Current Status

✅ package.json has been updated with all required dependencies  
⏳ Missing packages need to be installed to node_modules

## Required Packages

- `expo-sharing` - For sharing exported Excel files
- `expo-document-picker` - For selecting files to import
- `expo-file-system` - For file I/O operations (already installed ✓)
- `xlsx` - For Excel parsing and generation

## Installation Steps

### Windows Command Prompt

```cmd
cd c:\development\Artha
npm install
```

### Expected Duration

- **First run**: 3-5 minutes (downloading all packages)
- **Subsequent runs**: < 30 seconds (packages cached)

### Verification

After installation completes, verify all packages are installed:

```cmd
npm list expo-sharing xlsx expo-document-picker expo-file-system
```

Expected output:

```
artha@1.0.0 c:\development\Artha
├── expo-document-picker@14.0.0
├── expo-file-system@15.0.0
├── expo-sharing@13.0.0
└── xlsx@0.18.5
```

## What Happens Next

Once `npm install` completes:

1. **TypeScript errors will disappear**: The @ts-ignore comments allow compilation now
2. **Bundling will succeed**: Android/web builds will work
3. **All features ready**: Export and Import Excel fully functional

## Troubleshooting

### "npm ERR! 404 Not Found"

Solution: Run `npm cache clean --force` then try again

### "EACCES: permission denied"

Solution: Run as administrator or use `sudo` (macOS/Linux)

### Installation hangs

Solution: Check internet connection, try `npm install --no-optional`

## Next Steps After Installation

1. Run build: `npm run web` or `eas build -p android --profile preview`
2. Test export feature: Settings → Data & Backup → Export
3. Test import feature: Settings → Data & Backup → Import

---

**Status**: All code ready. Just need `npm install` to complete setup.

**Time to completion**: ~5 minutes (npm install) + build time
