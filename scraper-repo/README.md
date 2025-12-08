# RSS Scraper (Obfuscated)

This repository contains the **obfuscated** scraper code that runs on GitHub Actions.

## 🔒 Security Model

- **`src/`** - Source code (kept PRIVATE, not pushed to GitHub)
- **`dist/`** - Obfuscated compiled code (PUBLIC, runs on GitHub Actions)

## 🚀 Development Workflow

### 1. Make Changes Locally
Edit files in `src/` folder.

### 2. Build & Obfuscate
```bash
npm run build
```
This will:
- Compile TypeScript → JavaScript
- Obfuscate the code
- Output to `dist/`

### 3. Test Locally
```bash
npm run test
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Update scraper"
git push
```

⚠️ **Important**: Only `dist/` is pushed. Source code stays private.

## 📊 GitHub Actions

### Schedule
Runs **every 6 hours**: 00:00, 06:00, 12:00, 18:00 UTC

### Auto-Scaling Batches
- Target: ~5 sources per batch
- Max: 8 parallel batches
- Unused batches auto-skip

| Sources | Batches Used |
|---------|--------------|
| 1-5 | 1 |
| 6-10 | 2 |
| 11-20 | 4 |
| 21-40 | 8 |

### Manual Trigger
Go to **Actions** tab → **Daily Job Update** → **Run workflow**

## 📝 Adding New Sources

1. Edit `src/sources.ts` locally
2. Run `npm run build`
3. Push to GitHub
4. Auto-scaling will handle the rest

## 🎯 Output

- **Daily JSON**: `output/YYYY-MM-DD.json`
- **Index**: `output/index.json`
- **Error Log**: `output/error-log.json`
