import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Workspace } from "@/components/app/Workspace";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <Workspace userEmail={user.email ?? ""} />;
}
