import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Chat } from "@/components/app/Chat";
import { LogoutButton } from "@/components/app/LogoutButton";
import { TaskList } from "@/components/app/TaskList";
import { AppTabs } from "@/components/app/AppTabs";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-6">
          <a href="/" aria-label="gotan.ia" className="flex items-center">
            <Image
              src="/branding/gotan-logo-horizontal.png"
              alt="gotan.ia"
              width={1370}
              height={500}
              priority
              className="h-8 w-auto"
            />
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <AppTabs chatContent={<Chat />} tasksContent={<TaskList />} />
    </div>
  );
}
