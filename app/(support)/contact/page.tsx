import Link from 'next/link'
import { ContactForm } from '@/components/support/ContactForm'
import { Mail, Clock, Github, Twitter } from 'lucide-react'

export default function ContactPage() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Have a question or need help? We're here to assist you. Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>
          <ContactForm />
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a href="mailto:support@fixr.ai" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    support@fixr.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Response Time</p>
                  <p className="text-gray-400">Within 24 hours for most inquiries</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Github className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">GitHub</p>
                  <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    github.com/jatin12-alt
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Twitter className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Twitter</p>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    @fixr_ai
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Before You Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">→</span>
                <Link href="/help" className="hover:text-white transition-colors">
                  Check our Help Center for common questions
                </Link>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">→</span>
                Visit our{' '}
                <Link href="/status" className="hover:text-white transition-colors ml-1">
                  Status Page
                </Link>
                {' '}for service issues
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">→</span>
                Security issues? Email security@fixr.ai directly
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Support</h3>
            <p className="text-gray-400 mb-4">
              Need dedicated support for your team? Contact us for enterprise plans with priority support and SLA guarantees.
            </p>
            <a href="mailto:enterprise@fixr.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              enterprise@fixr.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
