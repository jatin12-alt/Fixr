'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AccordionItem } from '@/components/support/AccordionItem'

interface FAQCategory {
  id: string
  name: string
  faqs: {
    id: string
    question: string
    answer: React.ReactNode
  }[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    faqs: [
      {
        id: 'connect-github',
        question: 'How do I connect my GitHub account?',
        answer: (
          <>
            <p className="mb-2">Connecting your GitHub account is simple:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Sign up or log in to Fixr</li>
              <li>Click "Connect GitHub" on the dashboard</li>
              <li>Authorize Fixr to access your repositories</li>
              <li>Select which repositories to monitor</li>
            </ol>
          </>
        ),
      },
      {
        id: 'add-repo',
        question: 'How do I add a repository?',
        answer: (
          <>
            <p className="mb-2">Once connected to GitHub:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your Dashboard</li>
              <li>Click "Add Repository"</li>
              <li>Select from your available GitHub repos</li>
              <li>Configure monitoring settings</li>
              <li>Enable webhooks for automatic detection</li>
            </ol>
          </>
        ),
      },
      {
        id: 'webhook-setup',
        question: 'How do I set up webhooks?',
        answer: (
          <>
            <p>Fixr automatically configures webhooks when you add a repository. No manual setup required! The webhook will trigger Fixr whenever a CI/CD pipeline runs.</p>
          </>
        ),
      },
      {
        id: 'dashboard-overview',
        question: 'Understanding the dashboard',
        answer: (
          <>
            <p className="mb-2">Your dashboard shows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Connected repositories with status</li>
              <li>Recent pipeline runs and their outcomes</li>
              <li>AI analysis results and confidence scores</li>
              <li>Time saved and fix statistics</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: 'ai-analysis',
    name: 'AI Analysis',
    faqs: [
      {
        id: 'what-analyzes',
        question: 'What does Fixr analyze?',
        answer: (
          <>
            <p className="mb-2">Fixr analyzes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>CI/CD pipeline failures from GitHub Actions</li>
              <li>Error messages and stack traces</li>
              <li>Configuration issues (package.json, imports, etc.)</li>
              <li>Build and test failures</li>
              <li>Dependency and version conflicts</li>
            </ul>
          </>
        ),
      },
      {
        id: 'accuracy',
        question: 'How accurate is AI analysis?',
        answer: (
          <>
            <p>Fixr provides confidence scores with each analysis. Our AI is trained on thousands of CI/CD failures and achieves 85-95% accuracy for common errors. Complex issues may require manual review. Always test suggested fixes in a development environment first.</p>
          </>
        ),
      },
      {
        id: 'auto-fix',
        question: 'What errors can Fixr auto-fix?',
        answer: (
          <>
            <p className="mb-2">Auto-fix works best for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Missing dependencies in package.json</li>
              <li>Incorrect import paths</li>
              <li>Simple configuration errors</li>
              <li>Version mismatches</li>
            </ul>
            <p className="mt-2 text-yellow-400">Complex errors requiring code logic changes are flagged for manual review.</p>
          </>
        ),
      },
      {
        id: 'manual-trigger',
        question: 'How to trigger manual analysis',
        answer: (
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Navigate to a repository in your dashboard</li>
              <li>Click on a failed pipeline run</li>
              <li>Click "Analyze Now" to re-run AI analysis</li>
              <li>View updated results and confidence scores</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    faqs: [
      {
        id: 'payload-format',
        question: 'Webhook payload format',
        answer: (
          <>
            <p>Fixr expects GitHub Actions webhook payloads with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code>action</code> - The webhook event type</li>
              <li><code>workflow_run</code> - Run details including conclusion, name, SHA</li>
              <li><code>repository</code> - Repository information</li>
            </ul>
          </>
        ),
      },
      {
        id: 'troubleshooting',
        question: 'Troubleshooting webhook failures',
        answer: (
          <>
            <p className="mb-2">If webhooks aren't working:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Check that the repository is still connected</li>
              <li>Verify GitHub Actions is enabled in the repo</li>
              <li>Re-add the repository to refresh the webhook</li>
              <li>Check webhook delivery status in GitHub Settings {'>'} Webhooks</li>
              <li>Contact support if issues persist</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'account',
    name: 'Account & Billing',
    faqs: [
      {
        id: 'delete-account',
        question: 'How to delete your account',
        answer: (
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to Settings</li>
              <li>Click "Delete Account" at the bottom</li>
              <li>Confirm deletion (this cannot be undone)</li>
              <li>All data will be permanently removed within 30 days</li>
            </ol>
          </>
        ),
      },
      {
        id: 'revoke-github',
        question: 'How to revoke GitHub access',
        answer: (
          <>
            <p>You can revoke access two ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>In Fixr: Settings {'>'} GitHub {'>'} Disconnect</li>
              <li>In GitHub: Settings {'>'} Applications {'>'} Authorized OAuth Apps {'>'} Revoke Fixr</li>
            </ul>
          </>
        ),
      },
      {
        id: 'export-data',
        question: 'How to export your data',
        answer: (
          <>
            <p>Go to Settings {'>'} Data Export. You'll receive a JSON file containing:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Repository information</li>
              <li>Pipeline run history</li>
              <li>Analysis results</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    faqs: [
      {
        id: 'github-issues',
        question: 'GitHub connection issues',
        answer: (
          <>
            <p className="mb-2">If you can't connect to GitHub:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure you're logged into the correct GitHub account</li>
              <li>Check that your organization allows OAuth apps</li>
              <li>Clear browser cache and try again</li>
              <li>Try an incognito/private browser window</li>
            </ul>
          </>
        ),
      },
      {
        id: 'pipeline-not-showing',
        question: 'Pipeline not showing up',
        answer: (
          <>
            <p className="mb-2">If pipelines aren't appearing:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Verify the repository has GitHub Actions workflows</li>
              <li>Check that the workflow has run at least once</li>
              <li>Re-add the repository to refresh the connection</li>
              <li>Wait 1-2 minutes for the first webhook to arrive</li>
            </ol>
          </>
        ),
      },
      {
        id: 'ai-not-triggering',
        question: 'AI analysis not triggering',
        answer: (
          <>
            <p className="mb-2">If AI analysis isn't running:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check that the pipeline has actually failed (not just completed)</li>
              <li>Verify your repository is on a paid plan (AI is limited on free tier)</li>
              <li>Try manual analysis from the pipeline details page</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </>
        ),
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('getting-started')
  const [openFaqs, setOpenFaqs] = useState<string[]>([])

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => 
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    )
  }

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter(category => category.faqs.length > 0)

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Find answers to common questions about Fixr. Can't find what you're looking for? Contact our support team.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <div className="hidden lg:block">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Categories
          </h3>
          <nav className="space-y-1">
            {faqCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeCategory === category.id
                    ? 'text-cyan-400 bg-gray-900'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-3">
          {searchQuery ? (
            // Search results
            filteredCategories.map(category => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-white mb-4">{category.name}</h2>
                <div className="space-y-3">
                  {category.faqs.map(faq => (
                    <AccordionItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFaqs.includes(faq.id)}
                      onToggle={() => toggleFaq(faq.id)}
                    />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            // Category view
            faqCategories
              .filter(cat => cat.id === activeCategory)
              .map(category => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">{category.name}</h2>
                  <div className="space-y-3">
                    {category.faqs.map(faq => (
                      <AccordionItem
                        key={faq.id}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openFaqs.includes(faq.id)}
                        onToggle={() => toggleFaq(faq.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
          )}

          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl mx-auto">
          <MessageCircle className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-gray-400 mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <Link href="/contact">
            <Button variant="default" size="lg">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
