import { SignUp } from "@clerk/nextjs"
import { AuthLeftPanel } from "@/components/auth/auth-left-panel"

export default function SignUpPage() {
  return (
    <div className="flex h-screen bg-base">
      <div className="hidden lg:block lg:w-1/2 bg-surface border-r border-surface-border overflow-hidden">
        <AuthLeftPanel />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <SignUp />
      </div>
    </div>
  )
}
