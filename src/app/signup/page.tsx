import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="bg-glow flex min-h-screen items-center justify-center px-6">
      <AuthForm mode="signup" />
    </main>
  );
}
