import { Bell, ChevronDown, MessageSquare, Search } from "lucide-react";

const HeaderIndex = () => {
  return (
    <header className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/20">
          TF
        </div>
        <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
      </div>
      {/* Thanh Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search to search..."
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-600">
          Ctrl+K
        </kbd>
      </div>
      {/* Quick Action & User */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
          <MessageSquare className="w-4 h-4" />
        </button>
        <div className="relative">
          <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
            3
          </span>
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
            alt="Alex Rivera"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              Alex Rivera
            </span>
            <span className="text-[10px] text-slate-400">Logged in</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </div>
    </header>
  );
};
export default HeaderIndex;
