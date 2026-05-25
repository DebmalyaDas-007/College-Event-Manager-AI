import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, UserCheck, Sparkles } from "lucide-react";

export default function AuthCallback() {
  const { getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState("Securing tunnel connection...");

  // Shifting loader messages for high premium visual look
  useEffect(() => {
    const messages = [
      "Securing tunnel connection...",
      "Resolving Clerk token signatures...",
      "Verifying administrator credentials...",
      "Matching permission clearances...",
      "Finalizing intelligent routing..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < messages.length - 1) {
        idx++;
        setStatusText(messages[idx]);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAuthVerification = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // 0. High priority check: If they are already approved in Clerk metadata as admin
        if (user?.publicMetadata?.role === "admin") {
          const adminRes = await fetch("http://localhost:8000/api/v1/admin/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (adminRes.ok) {
            setStatusText("Clearance granted. Welcome Administrator!");
            setTimeout(() => {
              navigate("/admin-dashboard");
            }, 400);
          } else {
            setStatusText("Setting up administrator workspace...");
            setTimeout(() => {
              navigate("/admin-onboarding");
            }, 400);
          }
          return;
        }

        // 1. Check if the user is a registered Admin
        const adminRes = await fetch("http://localhost:8000/api/v1/admin/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (adminRes.ok) {
          // Check if approved in metadata
          if (user?.publicMetadata?.role === "admin") {
            setStatusText("Clearance granted. Welcome Administrator!");
            setTimeout(() => {
              navigate("/admin-dashboard");
            }, 400);
          } else {
            setStatusText("Routing to Admin review panel...");
            setTimeout(() => {
              navigate("/admin-onboarding");
            }, 400);
          }
          return;
        }

        // 2. If not registered, check if they explicitly chose "admin" on landing page
        if (localStorage.getItem("userRoleChoice") === "admin") {
          localStorage.removeItem("userRoleChoice");
          setStatusText("Initializing organizer onboarding tunnel...");
          setTimeout(() => {
            navigate("/admin-onboarding");
          }, 400);
          return;
        }

        // 3. Otherwise, verify / create Student Profile
        setStatusText("Resolving Student credentials...");
        const studentRes = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (studentRes.ok) {
          const profile = await studentRes.json();
          const userProfile = profile.profile || profile;

          // If brand new student (not onboarded yet)
          if (!userProfile.college || userProfile.college === "Not Specified") {
            setStatusText("Routing to Student onboarding...");
            setTimeout(() => {
              navigate("/onboarding");
            }, 400);
          } else {
            // Established student -> go to Dashboard
            setStatusText("Clearance granted. Welcome Student!");
            setTimeout(() => {
              navigate("/dashboard");
            }, 400);
          }
        } else {
          // Fallback: Default to student onboarding
          navigate("/onboarding");
        }
      } catch (err) {
        console.error("Auth callback routing error:", err);
        // Fallback
        navigate("/");
      }
    };

    if (userLoaded) {
      handleAuthVerification();
    }
  }, [getToken, userLoaded, navigate]);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans flex flex-col items-center justify-center selection:bg-purple-500/30">
      {/* Background glowing elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Futuristic scanner visualizer */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
        
        {/* Core animated ring */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping duration-[2000ms]" />
          <div className="absolute -inset-1.5 rounded-full border-t-2 border-purple-500 border-r-2 border-r-transparent animate-spin duration-1000" />
          <div className="absolute -inset-4 rounded-full border-b-2 border-blue-500 border-l-2 border-l-transparent animate-spin duration-[1500ms] ease-in-out direction-reverse" />
          
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-xl shadow-purple-500/10 relative">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Text descriptions */}
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-tight">
          Nexus Authorization Gate
        </h2>
        
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-2 min-h-6 flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
          {statusText}
        </p>

        {/* Subtle footer */}
        <p className="text-[10px] text-zinc-600 mt-16 leading-relaxed max-w-xs cursor-default">
          Double-pass verification powered by Clerk Tokens & Nexus MongoDB authorization matrices.
        </p>
      </div>

      {/* Tech Grid Background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
}
