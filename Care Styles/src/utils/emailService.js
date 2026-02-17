import emailjs from '@emailjs/browser'

// EmailJS configuration
// You'll need to set up an EmailJS account and get these values
// Visit https://www.emailjs.com/ to set up your account
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID' // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID' // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key

/**
 * Initialize EmailJS
 */
export function initEmailJS() {
  if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY)
    return true
  }
  return false
}

/**
 * Send patient segment results via email
 * @param {Object} userInfo - User information (firstName, lastName, email)
 * @param {Object} segmentResult - Segment identification result
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendResultsEmail(userInfo, segmentResult) {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      console.warn('EmailJS is not configured. Please set up your EmailJS credentials.')
      return {
        success: false,
        error: 'Email service is not configured. Please contact support.'
      }
    }

    initEmailJS()

    const { firstName, lastName, email } = userInfo
    const { segment, segmentName, scores } = segmentResult

    // Format scores for email
    const scoresText = Object.entries(scores)
      .map(([segNum, score]) => `Segment ${segNum}: ${score.toFixed(2)}`)
      .join('\n')

    const templateParams = {
      to_name: `${firstName} ${lastName}`,
      to_email: email,
      segment_number: segment,
      segment_name: segmentName,
      scores: scoresText,
      user_email: email,
      first_name: firstName,
      last_name: lastName
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    return {
      success: true,
      messageId: response.text
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.text || 'Failed to send email. Please try again later.'
    }
  }
}

/**
 * Generate email content (for fallback or preview)
 */
export function generateEmailContent(userInfo, segmentResult) {
  const { firstName, lastName } = userInfo
  const { segment, segmentName, scores } = segmentResult

  const scoresList = Object.entries(scores)
    .map(([segNum, score]) => `  • Segment ${segNum}: ${score.toFixed(2)}`)
    .join('\n')

  return `
Dear ${firstName} ${lastName},

Thank you for completing the CareStyles™ Patient Segment Identification.

Your Patient Segment: ${segmentName} (Segment ${segment})

Segment Scores:
${scoresList}

The segment with the highest score represents your predicted patient segment based on the CareStyles™ algorithm, which has an accuracy rate of 85.3%.

Best regards,
CareStyles™ Team
  `.trim()
}
