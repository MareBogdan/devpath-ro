import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlossarClient } from "@/components/glossar/glossar-client";

export const metadata = {
  title: "Glosar AI | DevPath RO",
  description: "Termeni AI/ML/NLP/Python explicați în română",
};

export interface GlossarTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  created_at: string;
}

export default async function GlossarPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: terms, error } = await supabase
    .from("glossar_terms")
    .select("id, term, definition, category, created_at")
    .order("category")
    .order("term");

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nu s-au putut încărca termenii. Încearcă din nou.
      </div>
    );
  }

  return <GlossarClient terms={terms ?? []} />;
}
