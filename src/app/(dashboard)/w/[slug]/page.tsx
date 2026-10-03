import { Header } from "@/components/workspace/header";

import ContentMain from "@/components/workspace/content-main";

export default function WorkspaceDashboard({ params }: { params: { slug: string } }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-slate-100">
      <Header />

      <ContentMain />
    </div>
  );
}
