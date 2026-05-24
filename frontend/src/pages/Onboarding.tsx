import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, Sparkles, Zap } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans flex items-center justify-center selection:bg-purple-500/30">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl px-6 relative z-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 animate-pulse">
          <Zap className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Nexus AI
          </span>
        </h1>
        
        <p className="text-zinc-400 text-lg max-w-md mx-auto mb-12">
          Before we begin, tell us your role. We'll customize your campus event experience based on who you are.
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-xl">
          {/* Card A: Student */}
          <Card 
            onClick={() => navigate("/profile")}
            className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-xl hover:shadow-purple-500/10 text-left"
          >
            <CardContent className="p-6 flex flex-col justify-between h-56">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-500/20">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors flex items-center gap-2">
                  Student Account <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Discover hackathons, workshops, and earn coins/rewards by engaging in campus activities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Organizer */}
          <Card 
            onClick={() => navigate("/admin-onboarding")}
            className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-blue-500/30 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-xl hover:shadow-blue-500/10 text-left"
          >
            <CardContent className="p-6 flex flex-col justify-between h-56">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500/20">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors flex items-center gap-2">
                  Club Organizer <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Post and manage events, track registrations, and view advanced analytics for your college.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
