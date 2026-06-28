// ============================================================
// COMPUNIL — Terms of Service
// ============================================================

import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Compunil' }

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using the Compunil website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
    },
    {
      title: '2. Products & Pricing',
      content: 'All prices are listed in Egyptian Pounds (EGP) and include VAT where applicable. Compunil reserves the right to modify prices at any time. Product availability is subject to stock levels and may change without notice.',
    },
    {
      title: '3. Orders & Payment',
      content: 'We currently offer Cash on Delivery (COD) as our primary payment method. Orders are confirmed upon placement and may be cancelled within 2 hours. Compunil reserves the right to cancel orders due to stock unavailability or payment issues.',
    },
    {
      title: '4. Shipping & Delivery',
      content: 'Free delivery is available on orders over EGP 500. Delivery times vary by governorate — typically 1–3 business days within Greater Cairo and 3–7 business days for other governorates. Delivery timeframes are estimates and not guaranteed.',
    },
    {
      title: '5. Returns & Refunds',
      content: 'Products may be returned within 14 days of delivery if they are in their original condition and packaging. Defective products are eligible for replacement or full refund. Installation services are non-refundable once completed.',
    },
    {
      title: '6. Warranty',
      content: 'All products sold by Compunil carry the manufacturer\'s warranty. Warranty claims must be submitted with original proof of purchase. Compunil acts as a facilitator for warranty claims and cannot guarantee timelines set by manufacturers.',
    },
    {
      title: '7. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Compunil is not liable for any loss resulting from unauthorized account use.',
    },
    {
      title: '8. Limitation of Liability',
      content: 'Compunil\'s liability is limited to the value of the purchased product. We are not liable for indirect, consequential, or incidental damages arising from the use of our products or services.',
    },
    {
      title: '9. Changes to Terms',
      content: 'Compunil reserves the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.',
    },
    {
      title: '10. Contact',
      content: 'For questions about these terms, please contact our support team via the website or visit one of our store locations.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-brand-teal hover:underline">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-brand-navy mt-4 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: January 2025</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        {sections.map(({ title, content }) => (
          <section key={title}>
            <h2 className="text-lg font-bold text-brand-navy mb-2">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 p-5 bg-blue-50 rounded-2xl text-sm text-gray-600">
        Questions? Contact us at{' '}
        <a href="mailto:support@compunil.com" className="text-brand-teal hover:underline">
          support@compunil.com
        </a>
      </div>
    </div>
  )
}
