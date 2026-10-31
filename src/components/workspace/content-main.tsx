/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { CreateBoardModal } from "./create-board-modal";
import { WorkspaceMember } from "@/types/workSpace";
import { useAuthStore } from "@/store/useAuthStore";
import { WorkspaceRole } from "@/types";
import { WorkspaceChat } from "./workspace-chat";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { BoardsView } from "./BoardsView";
import { MemberSidebar } from "./MemberSidebar";
import { LoadingModal } from "../ui/loading-modal";

interface ContentMainProps {
  activeMainTab: "boards" | "chat";
  isMemberSidebarOpen: boolean;
  setIsMemberSidebarOpen: (open: boolean) => void;
}

const ContentMain = ({
  activeMainTab,
  isMemberSidebarOpen,
  setIsMemberSidebarOpen,
}: ContentMainProps) => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const userCurrent = useAuthStore((state) => state.user);
  const userId = userCurrent?.id;

  const { data: workspaceDetail, isLoading } = useWorkspaceDetail(activeWorkspaceId);

  const members = workspaceDetail?.members;
  const isOwn = Boolean(
    members &&
    userId &&
    members.some(
      (m) =>
        (m.user?.id === userId && m.role === "OWNER") ||
        m.role === WorkspaceRole.LEADER_WORKSPACE,
    ),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const membersList = useMemo(
    () => workspaceDetail?.members ?? [],
    [workspaceDetail?.members],
  );

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersList;
    const query = searchQuery.toLowerCase();

    return membersList.filter((m: WorkspaceMember) => {
      const userName = m.user?.name?.toLowerCase() ?? "";
      const userEmail = m.user?.email?.toLowerCase() ?? "";
      const memberRole = m.role?.toLowerCase() ?? "";

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        memberRole.includes(query)
      );
    });
  }, [membersList, searchQuery]);

  if (isLoading)
    return (
      <LoadingModal
        isOpen={isLoading}
        message="Xin chờ trong giây lát"
        blurBackground={true}
      />
    );
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden relative">
      {/* MAIN BODY AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6 text-slate-200">
        <WorkspaceHeader
          name={workspaceDetail?.name}
          description={workspaceDetail?.description || ""}
          activeMainTab={activeMainTab}
          isOwn={isOwn}
          onCreateBoardClick={() => setIsModalOpen(true)}
        />

        {/* VIEW 1: BOARDS */}
        {activeMainTab === "boards" && (
          <BoardsView
            boards={workspaceDetail?.boards}
            members={workspaceDetail?.members ?? []}
          />
        )}

        {/* VIEW 2: CHAT */}
        {activeMainTab === "chat" && (
          <WorkspaceChat
            workspaceId={activeWorkspaceId}
            userId={userId}
            workspaceMembers={members}
          />
        )}

        <CreateBoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceMembers={membersList}
        />
      </main>

      {/* RIGHT SIDEBAR MEMBERS */}
      <MemberSidebar
        isOpen={isMemberSidebarOpen}
        onToggleOpen={setIsMemberSidebarOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredMembers={filteredMembers}
        membersCount={membersList.length}
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
      />
    </div>
  );
};

export default ContentMain;
