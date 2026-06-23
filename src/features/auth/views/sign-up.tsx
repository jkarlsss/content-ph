import { SignupForm } from '../components/signup-form';

export default function SignUp() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Content<span className="text-primary">PH</span>
          </div>
        </a>
        <SignupForm />
      </div>
    </div>
  )
}
