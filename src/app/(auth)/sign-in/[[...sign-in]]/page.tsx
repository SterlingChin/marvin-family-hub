import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
