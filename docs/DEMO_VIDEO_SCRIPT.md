# Demo Video Script — AgriShield

## Video Details
- **Title:** AgriShield — Parametric Micro-Insurance on Stellar/Soroban
- **Duration:** ~5 minutes
- **Resolution:** 1920x1080 (or 1280x720 for faster recording)
- **Tools:** OBS Studio, screen recorder, or Loom

---

## Script

### Scene 1: Introduction (0:00 – 0:30)

**Visual:** Title card with AgriShield logo and tagline

**Narration:**
> "AgriShield is a parametric micro-insurance platform built on Stellar and Soroban. It protects smallholder farmers in Nigeria against drought using automated weather-indexed triggers. When rainfall drops below a threshold, payouts happen automatically — no claims adjusters needed."

---

### Scene 2: Dashboard Overview (0:30 – 1:00)

**Visual:** Navigate to Dashboard tab

**Narration:**
> "Here's the main dashboard. We can see the pool is Active with 10 farmers enrolled. The solvency ratio is 202%, meaning the pool has more than enough liquidity to cover all claims. The weather card shows live rainfall data from Open-Meteo for Kaduna, Nigeria."

**Show:**
- Pool status badge (Active)
- Farmer count (10)
- Solvency gauge (202%)
- Weather card with temperature, humidity, rainfall
- Threshold indicator (≤50mm)

---

### Scene 3: Connect Wallet (1:00 – 1:30)

**Visual:** Click "Connect Wallet" button

**Narration:**
> "To interact with the pool, we connect our Freighter wallet. Freighter is a browser extension for Stellar, similar to MetaMask for Ethereum."

**Show:**
- Click "Connect Wallet"
- Freighter popup appears
- Approve connection
- Wallet address shown in header

---

### Scene 4: Farmer Enrollment (1:30 – 2:00)

**Visual:** Navigate to Farmer tab

**Narration:**
> "As a farmer, I can enroll in the insurance pool by paying a 1 mUSD premium. This gives me coverage of 50 mUSD if rainfall drops below 50mm during the coverage window."

**Show:**
- Click "Enroll Now (1 mUSD)"
- Freighter transaction popup
- Confirm transaction
- Success toast notification
- Updated farmer status

---

### Scene 5: Investor Liquidity (2:00 – 2:30)

**Visual:** Navigate to Investor tab

**Narration:**
> "Liquidity providers can deposit mUSD into the pool to earn a share of premiums. The pool currently has 1,000 mUSD in liquidity."

**Show:**
- Deposit input field
- Enter amount (e.g., 100 mUSD)
- Click "Deposit"
- Freighter transaction popup
- Updated liquidity balance

---

### Scene 6: Oracle Reading (2:30 – 3:00)

**Visual:** Show terminal with oracle logs

**Narration:**
> "The oracle continuously monitors rainfall data from Open-Meteo. Every hour, it fetches the latest reading and submits it to the pool contract. Two independent oracles must agree within a tolerance of 10mm."

**Show:**
- Terminal showing oracle polling
- Weather API response
- Transaction submission to pool
- Reading stored on-chain

---

### Scene 7: Pool Trigger (3:00 – 3:30)

**Visual:** Simulate low rainfall scenario

**Narration:**
> "When rainfall drops to 30mm — below our 50mm threshold — and both oracles agree, the pool automatically triggers. This changes the pool state from Active to Triggered."

**Show:**
- Oracle submitting breach reading
- Pool state change event
- Triggered status in dashboard

---

### Scene 8: Claim Payout (3:30 – 4:00)

**Visual:** Navigate to Farmer tab, claim payout

**Narration:**
> "Now that the pool is triggered, enrolled farmers can claim their 50 mUSD payout. Let me claim mine."

**Show:**
- Click "Claim Payout"
- Freighter transaction popup
- Confirm transaction
- Success notification
- Updated claim status

---

### Scene 9: Feedback Form (4:00 – 4:15)

**Visual:** Navigate to Feedback tab

**Narration:**
> "Users can provide feedback through our integrated form. We collect ratings, ease of use, reliability assessments, and improvement suggestions."

**Show:**
- Fill in sample feedback
- Submit form
- Confirmation message
- Google Form link

---

### Scene 10: Architecture Overview (4:15 – 4:45)

**Visual:** Show architecture diagram

**Narration:**
> "Under the hood, AgriShield uses two Soroban smart contracts: the Insurance Pool and the MicroUSD stablecoin. The pool manages enrollment, liquidity, oracle triggers, and payouts. The oracle service runs as a Node.js daemon, fetching weather data and submitting readings."

**Show:**
- Architecture diagram from docs/ARCHITECTURE.md
- Contract addresses on Stellar Expert
- GitHub repository

---

### Scene 11: Closing (4:45 – 5:00)

**Visual:** Title card with links

**Narration:**
> "AgriShield is live on Stellar Testnet. Try it out at the link below. The code is open source on GitHub. Thank you for watching!"

**Show:**
- Live demo URL
- GitHub URL
- Contract addresses
- Call to action

---

## Recording Tips

1. **Use a clean browser profile** — no personal bookmarks or extensions visible
2. **Pre-fund the wallet** — ensure testnet XLM and mUSD are available
3. **Test the flow first** — run through the entire demo before recording
4. **Slow down** — narrate slowly and pause between actions
5. **Use zoom** — zoom in on important UI elements
6. **Edit out mistakes** — trim any fumbles or long pauses
7. **Add captions** — subtitles help accessibility
8. **Export as MP4** — 1080p, H.264 codec, under 100MB for YouTube

## Post-Production

1. Record screen + voice separately if possible
2. Use [OBS Studio](https://obsproject.com) for recording
3. Edit with [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) (free) or [CapCut](https://capcut.com)
4. Upload to YouTube as unlisted
5. Add the link to README.md
