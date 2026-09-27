"use client";

import React from "react";
import { Header } from "@/components/workspace/header";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Key,
  Laptop,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-slate-100">
      <Header />

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Banner & Avatar Profile Header */}
        <div className="relative bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl -mx-6 -mt-6 mb-6 opacity-80" />

          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 relative z-10 px-2">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
                  alt="Alex Rivera"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-950 shadow-2xl"
                />
                <button className="absolute bottom-1 right-1 bg-indigo-600 p-1.5 rounded-lg text-white hover:bg-indigo-500 shadow-lg transition-all">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">Alex Rivera</h1>
                <p className="text-sm text-slate-400">alex.rivera@example.com</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Role: CUSTOMER</span>
                </div>
              </div>
            </div>

            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Save Changes
            </button>
          </div>
        </div>

        {/* Thông tin chi tiết Account Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột Trái: Personal Information */}
          <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    defaultValue="Alex Rivera"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    defaultValue="alex.rivera@example.com"
                    disabled
                    className="w-full bg-slate-800/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    defaultValue="+1 (555) 019-2834"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Birthday</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    defaultValue="1995-05-24"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Active Sessions & Connected Accounts */}
          <div className="space-y-6">
            {/* Active Sessions */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-400" />
                Active Sessions
              </h3>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 space-y-1 text-xs">
                <p className="font-semibold text-slate-200">Chrome on macOS</p>
                <p className="text-slate-400">IP: 192.168.1.1</p>
                <span className="inline-block text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium mt-1">
                  Current Session
                </span>
              </div>
            </div>

            {/* Authentication Provider */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Connected Provider
              </h3>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 text-xs">
                <span className="font-medium text-slate-300">Google OAuth</span>
                <span className="text-emerald-400 font-semibold">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
