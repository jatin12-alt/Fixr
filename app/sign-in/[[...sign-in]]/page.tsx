import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your Fixr account</p>
        </div>
        <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  )
}
