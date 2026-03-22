import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Create your Fixr account</p>
        </div>
        <SignUp routing="path" path="/sign-up" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  )
}
