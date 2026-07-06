'use client'
// ============================================================
// COMPUNIL — Footer Component (v3 — working links + WhatsApp)
// ============================================================

import Link from 'next/link'
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin, FiMessageCircle } from 'react-icons/fi'

import { useSettingsStore } from '../../store/settingsStore'

export default function Footer() {
  const { settings } = useSettingsStore()
  const PHONE    = settings.phone
  const WHATSAPP = settings.whatsapp
  const EMAIL    = settings.email

  const links = {
    shop: [
      { href: '/shop?category=laptops',    label: 'Laptops' },
      { href: '/shop?category=components', label: 'PC Components' },
      { href: '/shop?category=gaming',     label: 'Gaming Accessories' },
      { href: '/shop?category=networking', label: 'Networking' },
      { href: '/shop?category=cctv',       label: 'CCTV Cameras' },
      { href: '/shop',                     label: 'All Products' },
    ],
    account: [
      { href: '/auth/login',      label: 'Sign In' },
      { href: '/auth/register',   label: 'Create Account' },
      { href: '/account/orders',  label: 'My Orders' },
      { href: '/wishlist',        label: 'Wishlist' },
      { href: '/cart',            label: 'My Cart' },
    ],
    support: [
      { href: '/terms',    label: 'Terms of Service' },
      { href: '/privacy',  label: 'Privacy Policy' },
      { href: `https://wa.me/${WHATSAPP}`, label: 'WhatsApp Support', external: true },
      { href: `tel:${PHONE}`,              label: 'Call Us', external: true },
      { href: `mailto:${EMAIL}`,           label: 'Email Us', external: true },
    ],
  }

  return (
    <footer className="bg-brand-navydark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo-icon.png" alt="Compunil" className="w-11 h-11 object-contain bg-white/95 rounded-lg p-1" />
              <span className="font-bold text-xl text-white">
                Compu<span className="text-brand-green">nil</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Egypt's premier tech store for laptops, PC components, gaming accessories, networking equipment, and CCTV systems.
            </p>
            <div className="space-y-2.5 text-sm">
              <a href={`tel:${PHONE}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                <FiPhone size={15} className="text-brand-teal flex-shrink-0" /> {PHONE}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <FiMessageCircle size={15} className="text-green-400 flex-shrink-0" /> WhatsApp
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 hover:text-white transition-colors break-all">
                <FiMail size={15} className="text-brand-teal flex-shrink-0" /> {EMAIL}
              </a>
              <div className="flex items-start gap-2.5">
                <FiMapPin size={15} className="mt-0.5 text-brand-teal flex-shrink-0" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2.5">
              {links.shop.map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Account</h4>
            <ul className="space-y-2.5">
              {links.account.map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Support</h4>
            <ul className="space-y-2.5">
              {links.support.map(l => (
                <li key={l.href + l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-brand-navy/50 rounded-2xl p-5 sm:p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1">Stay Updated</h4>
              <p className="text-sm text-gray-400">Get exclusive deals and tech news delivered to your inbox.</p>
            </div>
            <form
              className="flex flex-col xs:flex-row gap-2 w-full"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-teal"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealdk rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Compunil Electronics Supply Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href={settings.facebook || '#'} target={settings.facebook ? '_blank' : undefined} rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-teal flex items-center justify-center transition-colors">
              <FiFacebook size={14} />
            </a>
            <a href={settings.instagram || '#'} target={settings.instagram ? '_blank' : undefined} rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-teal flex items-center justify-center transition-colors">
              <FiInstagram size={14} />
            </a>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors">
              <FiMessageCircle size={14} />
            </a>
          </div>
        </div>

        {/* Developer credit with logo */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center gap-3">
          <img src="/joe-logo.png" alt="Joe Industries" className="h-7 object-contain opacity-80" />
          <p className="text-xs text-gray-500 text-center">
            Developed &amp; designed by:{' '}
            <a
              href={`mailto:${EMAIL}`}
              className="text-brand-teal hover:text-white font-medium transition-colors"
            >
              Youssef Shrief
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
