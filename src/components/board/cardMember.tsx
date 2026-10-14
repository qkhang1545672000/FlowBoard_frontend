import { MemberBoard } from "@/types/board";
import { WorkspaceMember } from "@/types/workSpace";

const projectMembers = [
  { id: "p1", name: "Anh Pham", email: "anh.pham@email.com", role: "MEMBER" },
  { id: "p2", name: "Bao Tran", email: "bao.tran@email.com", role: "MEMBER" },
  { id: "p3", name: "Chau Le", email: "chau.le@email.com", role: "MEMBER" },
  { id: "p4", name: "Duc Nguyen", email: "duc.nguyen@email.com", role: "MEMBER" },
];
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface Props {
  member: MemberBoard | WorkspaceMember;
  selectedUserId: string | null;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string | null>>;
}
const CardMember = ({ member, selectedUserId, setSelectedUserId }: Props) => {
  return (
    <div
      key={member.id}
      onClick={() => setSelectedUserId(member.id)}
      className="flex items-center justify-between p-2.5 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center justify-center text-xs">
          {member.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200">{member.user.name}</div>
          <div className="text-xs text-slate-400">{member.user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-medium">
          {member.role}
        </span>
        {/* Radio button chọn 1 */}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            selectedUserId === member.id
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-slate-600"
          }`}>
          {selectedUserId === member.id && (
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          )}
        </div>
      </div>
    </div>
  );
};
export default CardMember;
