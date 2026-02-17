# EmailJS Setup Instructions

To enable email functionality in the CareStyles™ app, you need to set up an EmailJS account and configure the service.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier allows 200 emails/month)
3. Verify your email address

## Step 2: Create an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions to connect your email account
5. Note down your **Service ID**

## Step 3: Create an Email Template

1. Go to **Email Templates** in the EmailJS dashboard
2. Click **Create New Template**
3. Use the following template structure:

**Subject:** CareStyles™ Patient Segment Identification Results

**Content:**
```
Dear {{to_name}},

Thank you for completing the CareStyles™ Patient Segment Identification.

Your Patient Segment: {{segment_name}} (Segment {{segment_number}})

Segment Scores:
{{scores}}

The segment with the highest score represents your predicted patient segment based on the CareStyles™ algorithm, which has an accuracy rate of 85.3%.

Best regards,
CareStyles™ Team
```

4. Set the **To Email** field to: `{{to_email}}`
5. Save the template and note down your **Template ID**

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in the EmailJS dashboard
2. Find your **Public Key** (also called API Key)

## Step 5: Configure the App

1. Open `/src/utils/emailService.js`
2. Replace the following values:
   - `YOUR_SERVICE_ID` with your Service ID from Step 2
   - `YOUR_TEMPLATE_ID` with your Template ID from Step 3
   - `YOUR_PUBLIC_KEY` with your Public Key from Step 4

Example:
```javascript
const EMAILJS_SERVICE_ID = 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_xyz789'
const EMAILJS_PUBLIC_KEY = 'abcdefghijklmnop'
```

## Step 6: Test the Email Functionality

1. Run the app: `npm run dev`
2. Complete the registration and questionnaire
3. Check if the email is sent successfully

## Troubleshooting

- **Email not sending**: Check browser console for errors
- **Invalid credentials**: Verify all three IDs/keys are correct
- **Template errors**: Make sure template variables match exactly (case-sensitive)
- **Rate limits**: Free tier has 200 emails/month limit

## Alternative: Backend Email Service

If you prefer not to use EmailJS, you can:
1. Set up a backend API endpoint
2. Use services like SendGrid, AWS SES, or Nodemailer
3. Update the `sendResultsEmail` function in `emailService.js` to call your API
