# Screenshots

This directory contains screenshots of the AgriShield frontend for the README.

## How to Capture Screenshots

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser

3. Connect Freighter wallet (testnet)

4. Capture screenshots of each view:

### Required Screenshots

| File | View | Description |
|------|------|-------------|
| `dashboard.png` | Dashboard | Pool status, solvency gauge, weather card |
| `farmer.png` | Farmer | Enrollment status, claim button |
| `investor.png` | Investor | Liquidity management, deposit form |
| `weather.png` | Weather Card | Live weather data with threshold indicator |
| `feedback.png` | Feedback | User feedback form |
| `about.png` | About | How it works, contract addresses |

### Capture Tips

- Use a mobile viewport (375px width) for mobile-first design
- Use 1280px width for desktop view
- Ensure wallet is connected for authenticated views
- Use browser DevTools to resize the window
- Take full-page screenshots for complete views

### Recommended Tools

- **Browser DevTools** — Built-in screenshot feature
- **Lightshot** — Quick screenshot extension
- **CleanShot X** — Professional screenshots (macOS)
- **ShareX** — Free screenshot tool (Windows)

### Naming Convention

Use lowercase with hyphens: `dashboard.png`, `weather-card.png`, `farmer-enrolled.png`
