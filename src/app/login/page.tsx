import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="bg-glow flex min-h-screen items-center justify-center px-6">
      <AuthForm mode="login" />
    </main>
  );
}
