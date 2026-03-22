'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PricingTier {
  name: string
  price: { monthly: number; annual: number }
  description: string
  features: string[]
  cta: string
  href: string
  popular?: boolean
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for solo developers and side projects',
    features: [
      'Up to 3 repositories',
      '50 pipeline runs/month',
      'Basic AI fix suggestions',
      '7-day history',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/sign-up',
  },
  {
    name: 'Pro',
    price: { monthly: 12, annual: 9 },
    description: 'For professional developers and small teams',
    features: [
      'Unlimited repositories',
      'Unlimited pipeline runs',
      'Advanced AI analysis',
      '90-day history',
      'Email support',
      'Auto-fix capabilities',
      'Priority processing',
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Team',
    price: { monthly: 29, annual: 22 },
    description: 'For teams with advanced needs',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Role-based permissions',
      'Audit logs',
      'Priority support',
      'Custom webhooks',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

const faqs = [
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! Pro and Team plans include a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'What happens if I exceed my limits?',
    answer: "We'll notify you when you're approaching your limits. You won't lose any data, but new pipeline analysis may be paused until you upgrade.",
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. If Fixr is not working for you, contact us for a full refund.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use AES-256 encryption for your GitHub tokens, HTTPS everywhere, and never share your data with third parties.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-black text-gray-300 py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-gray-800 rounded-full p-1 transition-colors"
            >
              <motion.div
                className="w-6 h-6 bg-cyan-500 rounded-full"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full"
              >
                Save 25%
              </motion.span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                tier.popular
                  ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-cyan-500/50'
                  : 'bg-gray-900/50 border border-gray-800'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white">
                    ${isAnnual ? tier.price.annual : tier.price.monthly}
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                {isAnnual && tier.price.monthly > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    Save ${(tier.price.monthly - tier.price.annual) * 12}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.href}>
                <Button
                  className={`w-full ${
                    tier.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Feature Comparison
          </h2>
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-gray-400 font-medium">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-medium">Free</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-medium">Pro</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-medium">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="px-6 py-4 text-white">Repositories</td>
                  <td className="px-6 py-4 text-center text-gray-400">3</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Unlimited</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">Pipeline Runs/Month</td>
                  <td className="px-6 py-4 text-center text-gray-400">50</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Unlimited</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">AI Analysis</td>
                  <td className="px-6 py-4 text-center text-gray-400">Basic</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Advanced</td>
                  <td className="px-6 py-4 text-center text-cyan-400">Advanced</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">Auto-fix Capabilities</td>
                  <td className="px-6 py-4 text-center text-gray-500">—</td>
                  <td className="px-6 py-4 text-center text-green-400">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center text-green-400">
                    <Check className="h-5 w-5 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">History Retention</td>
                  <td className="px-6 py-4 text-center text-gray-400">7 days</td>
                  <td className="px-6 py-4 text-center text-gray-300">90 days</td>
                  <td className="px-6 py-4 text-center text-gray-300">1 year</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">Support</td>
                  <td className="px-6 py-4 text-center text-gray-400">Community</td>
                  <td className="px-6 py-4 text-center text-gray-300">Email</td>
                  <td className="px-6 py-4 text-center text-gray-300">Priority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">Team Members</td>
                  <td className="px-6 py-4 text-center text-gray-500">—</td>
                  <td className="px-6 py-4 text-center text-gray-500">—</td>
                  <td className="px-6 py-4 text-center text-gray-300">Up to 5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Sparkles className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to fix your CI/CD pipelines?
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Join thousands of developers who trust Fixr to monitor and fix their pipelines automatically.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
