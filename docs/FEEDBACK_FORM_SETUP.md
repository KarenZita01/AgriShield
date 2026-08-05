# Google Form Setup for User Feedback

## Step 1: Create the Form

1. Go to [https://forms.google.com](https://forms.google.com)
2. Click **Blank** to create a new form
3. Set title: **"AgriShield User Feedback"**
4. Set description: **"Help us improve AgriShield for smallholder farmers"**

## Step 2: Add Form Fields

### Personal Information Section

| Field | Type | Required | Options/Help Text |
|-------|------|----------|-------------------|
| Name | Short text | ✅ Yes | — |
| Email | Short text | ✅ Yes | Validation: Email |
| Wallet Address | Short text | No | Help: "Your Stellar public key (G...)" |
| Network | Dropdown | ✅ Yes | Options: Testnet, Mainnet |

### Rating Section

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Product Rating | Linear scale | ✅ Yes | 1 (Poor) to 5 (Excellent) |

### Feedback Questions Section

| # | Question | Type | Required | Options |
|---|----------|------|----------|---------|
| 1 | How easy was AgriShield to use? | Multiple choice | ✅ Yes | Very Easy, Easy, Neutral, Difficult, Very Difficult |
| 2 | How reliable do you find the parametric insurance mechanism? | Multiple choice | ✅ Yes | Very Reliable, Reliable, Neutral, Unreliable, Very Unreliable |
| 3 | What features would you like to see added? | Paragraph | No | — |
| 4 | Would you recommend AgriShield to other farmers? | Multiple choice | ✅ Yes | Yes, Maybe, No |
| 5 | Additional Comments | Paragraph | No | — |

## Step 3: Configure Settings

1. Click the **Settings** gear icon
2. Under **General**:
   - ✅ Collect email addresses
   - ✅ Limit to 1 response (requires Google sign-in)
3. Under **Presentation**:
   - Show progress bar
   - Shuffle question order: No
4. Under **Responses**:
   - ✅ Allow response editing
   - ✅ Send responders a copy of their response

## Step 4: Get the Form Link

1. Click **Send** button
2. Click the **Link** icon (chain link)
3. Check **Shorten URL**
4. Copy the shortened URL
5. It will look like: `https://forms.gle/XXXXXXXXXXXXX`

## Step 5: Update README.md

Replace `YOUR_GOOGLE_FORM_ID` in README.md with your actual form ID:

```markdown
**[📋 Fill out the Feedback Form](https://forms.gle/YOUR_ACTUAL_FORM_ID)**
```

## Step 6: Export Responses to Excel

1. In Google Forms, go to **Responses** tab
2. Click the green **Sheets** icon to link to Google Sheets
3. In Google Sheets: **File → Download → Microsoft Excel (.xlsx)**
4. Save as `docs/user_feedback.xlsx` in the project folder
5. Commit and push to GitHub

## Step 7: Update README with Excel Link

Update the Excel download link in README.md:

```markdown
**[📊 Download Feedback (Excel)](docs/user_feedback.xlsx)**
```

## Verification Checklist

- [ ] Form title is "AgriShield User Feedback"
- [ ] All 5 required fields are present
- [ ] Form is accessible via short link
- [ ] Link is added to README.md
- [ ] Excel export is in docs/user_feedback.xlsx
- [ ] Excel link is in README.md
