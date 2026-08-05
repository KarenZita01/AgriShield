# Google Form Setup for User Feedback

## Quick Setup

1. Go to https://forms.google.com and create a new form
2. Title: "AgriShield User Feedback"
3. Add these fields:

### Required Fields
- **Name** (Short text, required)
- **Email** (Short text, required)
- **Wallet Address** (Short text, optional) - Help text: "Your Stellar public key (G...)"
- **Network** (Dropdown: Testnet, Mainnet) - required

### Rating
- **Product Rating** (Linear scale 1-5, required)

### Feedback Questions
1. **How easy was AgriShield to use?** (Multiple choice: Very Easy, Easy, Neutral, Difficult, Very Difficult)
2. **How reliable do you find the parametric insurance mechanism?** (Multiple choice: Very Reliable, Reliable, Neutral, Unreliable, Very Unreliable)
3. **What features would you like to see added?** (Paragraph/long text)
4. **Would you recommend AgriShield to other farmers?** (Multiple choice: Yes, Maybe, No)

### Optional
- **Additional Comments** (Paragraph)

## Export to Excel

1. In Google Forms, go to "Responses" tab
2. Click the green Sheets icon to link to Google Sheets
3. In Google Sheets: File → Download → Microsoft Excel (.xlsx)
4. Save as `user_feedback.xlsx` in the `docs/` folder

## Update README

After creating the form, update the Google Form link in:
- README.md: Google Form link
- README.md: Excel download link
