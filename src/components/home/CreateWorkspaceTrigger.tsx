"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateWorkspaceCard from "./CreateWorkspaceCard";
import { formatWorkspaceSlug } from "@/lib/took";
import { useCreateWorkspace } from "@/hooks/useWorkSpace";

export const CreateWorkspaceTrigger = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { mutateAsync: createWorkspaceMutation } = useCreateWorkspace();

  const handleCreateWorkspace = async (name: string) => {
    try {
      const slug = formatWorkspaceSlug(name);
      await createWorkspaceMutation({ name, slug });
      setIsCreating(false);
    } catch (error) {
      // Xử lý lỗi UI nếu cần
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsCreating(true)}
        className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px] cursor-pointer">
        <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
        </div>
      </button>

      {isCreating && (
        <CreateWorkspaceCard
          onCancel={() => setIsCreating(false)}
          onSubmit={handleCreateWorkspace}
        />
      )}
    </>
  );
};
