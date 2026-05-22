import { useAuth, UserButton } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Bell, User } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            // Check if important criteria are filled
            const { college, department, interests } = data.profile;
            if (!college || !department || !interests || interests.length === 0) {
              setShowProfileWarning(true);
            } else {
              setShowProfileWarning(false);
            }
          }
        }
      } catch(e) {
        console.error("Error fetching profile", e);
      }
    };
    fetchProfile();
  }, [getToken, navigate]);

  return (
    <div className="dashboard relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Nexus Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="hidden md:flex bg-white/5 border-white/10 hover:bg-white/10">
              <Search className="w-4 h-4 text-zinc-300" />
            </Button>
            <Button variant="outline" size="icon" className="hidden md:flex bg-white/5 border-white/10 hover:bg-white/10">
              <Bell className="w-4 h-4 text-zinc-300" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <div className="pl-4 border-l border-white/10">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto relative z-10">
        {showProfileWarning && (
          <div className="mb-8 bg-purple-500/10 border border-purple-500/50 rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div>
              <h3 className="text-purple-400 font-semibold text-lg mb-1">Complete Your Profile!</h3>
              <p className="text-zinc-300">Fill up your profile with interests and skills to get better, personalized event recommendations.</p>
            </div>
            <Button onClick={() => navigate("/profile")} className="bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-lg shadow-purple-500/25">
              Complete Profile
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-zinc-400">Discover and manage events across campuses.</p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all"
            onClick={() => navigate("/createevent")}
          >
            Create New Event
          </Button>
        </div>

        {/* Dashboard Content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm animate-pulse"></div>
          <div className="h-64 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm animate-pulse"></div>
          <div className="h-64 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm animate-pulse"></div>
        </div>
      </main>
    </div>
  )
}
