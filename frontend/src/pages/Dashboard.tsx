import {
  UserButton
} from '@clerk/react';

import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";

export default function Dashboard() {
  
  return (
    <div className="dashboard">
      <div className="relative min-h-screen bg-white-zinc-640 text-zinc-50 overflow-hidden font-sans selection:bg-purple-500/30">
        {/* Background Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
              
              <span className="text-xl font-bold bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                Dashboard
              </span>
            </div>
            <Button variant="outline" size="icon" className="w-100 h-10">
              <Search className="w-4 h-4" />
            </Button>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button>
                <UserButton />
              </Button>
            </div>

            <div />
          </div>
        </nav>
      </div>
    </div>
  )
}
