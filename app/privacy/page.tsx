// ============================================================
// COMPUNIL — Privacy Policy
// ============================================================

import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Compunil' }

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly, including your name, email address, phone number, and delivery address when you create an account or place an order. We also automatically collect technical information such as browser type, IP address, and pages visited.',
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use your information to: process and deliver your orders; communicate about your orders and account; send promotional offers you\'ve opted into; improve our website and services; and comply with legal obligations.',
    },
    {
      title: '3. Information Sharing',
      content: 'We do not sell your personal information to third parties. We may share information with: delivery partners for order fulfillment; payment processors for secure transactions; service providers who help us operate our business; and authorities when required by law.',
    },
    {
      title: '4. Data Storage & Security',
      content: 'Your data is stored securely using Google Firebase services with encryption at rest and in transit. We implement industry-standard security measures to protect your information from unauthorized access, disclosure, or loss.',
    },
    {
      title: '5. Cookies',
      content: 'We use cookies to maintain your session, remember your preferences, and analyze site usage. Essential cookies cannot be disabled. You can control non-essential cookies through your browser settings.',
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to: access the personal data we hold about you; correct inaccurate information; request deletion of your account and data; opt out of marketing communications; and receive a copy of your data in a portable format.',
    },
    {
      title: '7. Data Retention',
      content: 'We retain your account data for as long as your account is active. Order records are kept for 7 years as required by Egyptian commercial law. You may request deletion of non-essential data at any time.',
    },
    {
      title: '8. Children\'s Privacy',
      content: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.',
    },
    {
      title: '9. Changes to this Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of significant changes via email or a prominent notice on our website.',
    },
    {
      title: '10. Contact Us',
      content: 'For privacy-related requests or questions, please contact our data protection team. We aim to respond to all requests within 30 days.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-brand-teal hover:underline">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-brand-navy mt-4 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: January 2025</p>
      </div>

      <div className="space-y-8">
        {sections.map(({ title, content }) => (
          <section key={title}>
            <h2 className="text-lg font-bold text-brand-navy mb-2">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 p-5 bg-blue-50 rounded-2xl text-sm text-gray-600">
        To exercise your rights or for privacy questions, email us at{' '}
        <a href="mailto:privacy@compunil.com" className="text-brand-teal hover:underline">
          privacy@compunil.com
        </a>
      </div>
    </div>
  )
}
