import { Folder, MoreHorizontal } from "lucide-react";
import GroupChatAvatar from "../ui/GroupChatAvatar";
import { WorkspaceResponse } from "@/types/workSpace";

import Link from "next/link";

interface Props {
  ws: WorkspaceResponse;
}
const WorkspaceCard = ({ ws }: Props) => {
  return (
    <Link
      key={ws.id}
      href={`/w/${ws.slug}`}
      className={`group bg-slate-900/80 hover:bg-slate-800/90 border border-indigo-500/50 hover:border-indigo-500/60 p-4 rounded-2xl transition-all shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
            <Folder className={`w-5 h-5 text-indigo-400`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
              {ws.name}
            </h3>
            <p className="text-[11px] text-slate-400">{ws.boardsCount} boards</p>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
        <div className="flex items-center -space-x-1.5">
          <GroupChatAvatar participants={ws.members} type="sidebar" maxVisible={3} />
        </div>
        <span>2 hours ago</span>
      </div>
    </Link>
  );
};
export default WorkspaceCard;
