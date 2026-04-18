/**
 * Sample emails for demo mode.
 * Covers all categories: Important, Action Required, Ignore, Spam
 */
const sampleEmails = [
  {
    id: 1,
    subject: "URGENT: Production Server Down — Immediate Action Needed",
    sender: "devops-alerts@company.com",
    body: `Hi Team,

Our production server (us-east-1) went down at 2:47 AM. The monitoring dashboard shows 503 errors across all endpoints. Customer-facing APIs are completely unreachable.

We need someone to SSH into the backup server and restart the load balancer immediately. The credentials are in the shared vault under "prod-recovery."

This is a P0 incident. Please acknowledge within 15 minutes.

— DevOps Automated Alert System`
  },
  {
    id: 2,
    subject: "Q3 Budget Review — Please Submit by Friday",
    sender: "sarah.chen@company.com",
    body: `Hi,

Hope you're doing well. As we approach the end of Q3, I need all department heads to submit their budget reports by this Friday, October 18th.

Please include:
- Current spend vs. allocated budget
- Projected expenses for Q4
- Any new headcount requests with justification

The finance team will consolidate everything over the weekend for the board meeting on Monday.

Let me know if you have any questions.

Best,
Sarah Chen
VP of Finance`
  },
  {
    id: 3,
    subject: "🎉 Flash Sale — 70% OFF Everything This Weekend Only!",
    sender: "deals@shopnow-promo.com",
    body: `MEGA FLASH SALE 🔥🔥🔥

You've been selected for our EXCLUSIVE weekend blowout!

70% OFF on ALL items — electronics, fashion, home & garden!

👉 USE CODE: SAVE70NOW
👉 Limited time only — expires Sunday midnight!
👉 FREE shipping on orders over $25!

Click here to shop now → www.shopnow-promo.com/sale

Don't miss out! This deal won't last!

Unsubscribe | Privacy Policy`
  },
  {
    id: 4,
    subject: "Meeting Notes: Product Roadmap Sync — Action Items Inside",
    sender: "james.park@company.com",
    body: `Hey team,

Thanks for joining today's product roadmap sync. Here's a quick recap:

Decisions Made:
- We're moving forward with the React Native migration for mobile
- Feature freeze for v2.0 is set for November 1st
- Beta launch targeted for November 15th

Action Items:
1. @You — Write the technical spec for the new auth flow by Oct 20
2. @Maria — Update the design system components in Figma
3. @Dev Team — Migrate the dashboard module to the new API by Oct 25

Next meeting: Thursday 3 PM. Please come with progress updates.

Cheers,
James`
  },
  {
    id: 5,
    subject: "Your AWS Invoice for September 2024",
    sender: "billing@aws.amazon.com",
    body: `Hello,

Your AWS invoice for the billing period September 1 - September 30, 2024 is now available.

Total Amount: $2,847.63
Payment Method: Visa ending in 4521
Payment Status: Auto-pay scheduled for October 5

You can view your detailed billing breakdown in the AWS Cost Explorer.

Service Breakdown:
- EC2: $1,203.45
- S3: $412.78
- RDS: $891.20
- Lambda: $198.32
- Other: $141.88

Thank you for using Amazon Web Services.

Best,
AWS Billing Team`
  },
  {
    id: 6,
    subject: "Congratulations! You've Won a $1000 Gift Card!!!",
    sender: "winner-notification@free-prizes-4u.xyz",
    body: `CONGRATULATIONS!!!

You have been randomly selected as our WINNER of a $1000 Amazon Gift Card!

To claim your prize, simply click the link below and enter your:
- Full Name
- Home Address
- Credit Card Number (for verification only)
- Social Security Number

CLAIM YOUR PRIZE NOW → www.free-prizes-4u.xyz/claim

This offer expires in 24 HOURS! Act NOW!

*This is a one-time offer. No purchase necessary.*`
  },
  {
    id: 7,
    subject: "Re: Partnership Proposal — Next Steps",
    sender: "michael.ross@techventures.io",
    body: `Hi,

Thanks for the great conversation last week. Our team has reviewed your proposal and we're very interested in moving forward with the partnership.

A few things we'd like to discuss:
1. Revenue sharing model — we'd prefer a 70/30 split
2. Integration timeline — can your team commit to a 6-week sprint?
3. Data privacy compliance — we need SOC 2 certification confirmation

Could we schedule a follow-up call this week? I'm available Wednesday or Thursday afternoon. Please have your legal team review the attached term sheet before we meet.

Looking forward to working together.

Best regards,
Michael Ross
Head of Partnerships, TechVentures`
  },
  {
    id: 8,
    subject: "Weekly Newsletter: Top 10 JavaScript Frameworks in 2024",
    sender: "newsletter@devdigest.io",
    body: `DevDigest Weekly — Issue #247

Hey developer! 👋

Here's what's trending this week:

📰 Top Stories:
1. The Rise of Bun: Is Node.js Finally Getting Competition?
2. React Server Components — A Complete Guide
3. Why TypeScript 5.3 Changes Everything
4. Astro 4.0 Released: What's New?
5. The State of CSS in 2024

🎯 Tutorial of the Week:
Building a Real-time Chat App with WebSockets and Deno

💼 Job Board Highlights:
- Senior Frontend Dev @ Stripe (Remote)
- Full-stack Engineer @ Vercel (SF/Remote)

Happy coding!

— The DevDigest Team

Unsubscribe | View in browser`
  },
  {
    id: 9,
    subject: "REMINDER: Health Insurance Enrollment Closes Tomorrow",
    sender: "hr@company.com",
    body: `Dear Employee,

This is a final reminder that the open enrollment period for health insurance benefits closes TOMORROW, October 15th at 11:59 PM EST.

If you haven't made your selections yet, please log into the benefits portal immediately.

Changes you can make:
- Switch between PPO and HMO plans
- Add or remove dependents
- Update dental and vision coverage
- Enroll in FSA/HSA accounts

If you do not make a selection, your current plan will auto-renew. However, this is the only time you can make changes until next year's open enrollment.

Benefits Portal: https://benefits.company.com

Questions? Contact HR at hr@company.com or ext. 4500.

Best,
Human Resources Department`
  },
  {
    id: 10,
    subject: "Coffee chat next week?",
    sender: "alex.thompson@gmail.com",
    body: `Hey!

It's been a while since we caught up. I just moved to a new apartment downtown and there's an amazing coffee shop around the corner.

Want to grab coffee sometime next week? I'm pretty flexible — Tuesday or Wednesday afternoon works best for me.

No rush, just thought it'd be nice to catch up!

Cheers,
Alex`
  }
];

export default sampleEmails;
