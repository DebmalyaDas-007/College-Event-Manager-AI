import React, { useState, useEffect } from "react";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Save, Sparkles, Plus, Calendar, MapPin, 
  Users, BarChart3, Shield, Info, ArrowLeft, Edit3, 
  Trash2, Globe, FileText, Bell, CheckCircle2, ChevronRight,
  TrendingUp, Award, Zap, Phone, Landmark, BookOpen
} from "lucide-react";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "events" | "profile" | "analytics">("overview");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 142,
    totalViews: 1205,
    engagementRate: "88%"
  });

  // Events list
  const [events, setEvents] = useState<any[]>([]);
  
  // Admin details matching models/admin_model.py
  const [adminProfile, setAdminProfile] = useState<any>({
    name: "",
    email: "",
    contact_phone: "",
    admin_role: "club_organizer",
    managed_college_id: "",
    club_profile: {
      club_name: "",
      club_type: "technical",
      post_held: "member",
      custom_post: "",
      college: "",
      department: "",
      year_of_study: "",
      club_description: "",
      social_instagram: "",
      social_linkedin: "",
      member_count: ""
    }
  });

  // AI draft generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Fetch admin profile and events on mount
  useEffect(() => {
    // 0. Enforce Clerk Metadata Role check!
    if (userLoaded && user && user.publicMetadata?.role !== "admin") {
      navigate("/admin-onboarding");
      return;
    }

    const loadAdminData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // 1. Fetch Admin Profile
        const profileRes = await fetch("http://localhost:8000/api/v1/admin/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileRes.ok) {
          const data = await profileRes.json();
          setAdminProfile({
            name: data.name || "",
            email: data.email || "",
            contact_phone: data.contact_phone || "",
            admin_role: data.admin_role || "club_organizer",
            managed_college_id: data.managed_college_id || "",
            club_profile: {
              club_name: data.club_profile?.club_name || "",
              club_type: data.club_profile?.club_type || "technical",
              post_held: data.club_profile?.post_held || "member",
              custom_post: data.club_profile?.custom_post || "",
              college: data.club_profile?.college || "",
              department: data.club_profile?.department || "",
              year_of_study: data.club_profile?.year_of_study ? data.club_profile.year_of_study.toString() : "",
              club_description: data.club_profile?.club_description || "",
              social_instagram: data.club_profile?.social_links?.instagram || "",
              social_linkedin: data.club_profile?.social_links?.linkedin || "",
              member_count: data.club_profile?.member_count ? data.club_profile.member_count.toString() : ""
            }
          });
        } else if (profileRes.status === 404) {
          // If no admin profile exists, redirect to admin onboarding!
          navigate("/admin-onboarding");
          return;
        }

        // 2. Fetch Events created by this Admin
        const eventsRes = await fetch("http://localhost:8000/api/v1/events/my-events", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
          setStats(prev => ({
            ...prev,
            totalEvents: eventsData.length
          }));
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        setFetching(false);
      }
    };

    loadAdminData();
  }, [getToken, navigate, user, userLoaded]);

  // Handle Admin Profile Update
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("club_profile.")) {
      const fieldName = name.split(".")[1];
      setAdminProfile((prev: any) => ({
        ...prev,
        club_profile: {
          ...prev.club_profile,
          [fieldName]: value
        }
      }));
    } else {
      setAdminProfile((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Auth expired");

      const payload: any = {
        name: adminProfile.name,
        contact_phone: adminProfile.contact_phone || null,
        admin_role: adminProfile.admin_role,
        managed_college_id: adminProfile.admin_role === "college_admin" ? adminProfile.managed_college_id : null
      };

      if (adminProfile.admin_role === "club_organizer" || adminProfile.admin_role === "fest_organizer") {
        payload.club_profile = {
          club_name: adminProfile.club_profile.club_name,
          club_type: adminProfile.club_profile.club_type,
          post_held: adminProfile.club_profile.post_held,
          custom_post: adminProfile.club_profile.post_held === "other" ? adminProfile.club_profile.custom_post : null,
          college: adminProfile.club_profile.college,
          department: adminProfile.club_profile.department || null,
          year_of_study: adminProfile.club_profile.year_of_study ? parseInt(adminProfile.club_profile.year_of_study) : null,
          club_description: adminProfile.club_profile.club_description || null,
          social_links: {
            instagram: adminProfile.club_profile.social_instagram || "",
            linkedin: adminProfile.club_profile.social_linkedin || ""
          },
          member_count: adminProfile.club_profile.member_count ? parseInt(adminProfile.club_profile.member_count) : null
        };
      }

      const res = await fetch("http://localhost:8000/api/v1/admin/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Admin profile updated successfully!");
      } else {
        const errorText = await res.text();
        alert(`Update failed: ${errorText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mock AI Event Generator
  const generateAIDraft = () => {
    if (!aiPrompt) return;
    setGeneratingAi(true);
    setTimeout(() => {
      setAiResult(
        `### ✨ AI Generated Event Outline: "${aiPrompt}"\n\n` +
        `**💡 Theme:** Innovation, collaboration, and rapid skill-building.\n\n` +
        `**📅 Recommended Duration:** 6 Hours (with networking session).\n\n` +
        `**✍️ Captivating Slogan:** "Unlock the future of campus tech with Nexus AI. Shape, build, and innovate together."\n\n` +
        `**📋 Outline Plan:**\n` +
        `- **Hour 01:** Inaugural address, introduction to key APIs & tools.\n` +
        `- **Hour 02-04:** Core building sprint, technical mentors on standby.\n` +
        `- **Hour 05:** Peer review, presentations, and rapid AI grading.\n` +
        `- **Hour 06:** Award ceremony & High-Tea networking.`
      );
      setGeneratingAi(false);
    }, 1800);
  };

  if (!userLoaded || fetching) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const inputClasses = "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const selectClasses = "w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-zinc-400 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background glowing elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Nexus Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 px-2.5 py-1 flex items-center gap-1.5 cursor-default">
              <Shield className="w-3.5 h-3.5" />
              <span>Organizer Mode</span>
            </Badge>
            <div className="pl-4 border-l border-white/10">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 flex flex-col gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("overview")}
            className={`w-full h-11 justify-start font-medium rounded-lg text-sm transition-all border-0 cursor-pointer ${
              activeTab === "overview" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-3" /> Dashboard Overview
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("events")}
            className={`w-full h-11 justify-start font-medium rounded-lg text-sm transition-all border-0 cursor-pointer ${
              activeTab === "events" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-4 h-4 mr-3" /> Manage My Events
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("profile")}
            className={`w-full h-11 justify-start font-medium rounded-lg text-sm transition-all border-0 cursor-pointer ${
              activeTab === "profile" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-3" /> Organizer Profile
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("analytics")}
            className={`w-full h-11 justify-start font-medium rounded-lg text-sm transition-all border-0 cursor-pointer ${
              activeTab === "analytics" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/15" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-3" /> Analytics & Reports
          </Button>

          <hr className="border-white/5 my-4" />

          <Button 
            onClick={() => navigate("/createevent")}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all flex items-center justify-center gap-2 border-0 cursor-pointer rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4" /> Host New Event
          </Button>
        </aside>

        {/* Dynamic content panel */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Premium Welcome Banner */}
              <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-purple-950/20 p-8 overflow-hidden shadow-2xl">
                <div className="absolute right-0 bottom-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                      Welcome, {adminProfile.name || user?.fullName}!
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base max-w-lg leading-relaxed">
                      You are logged in as {adminProfile.admin_role === "club_organizer" ? "Club Organizer" : adminProfile.admin_role === "fest_organizer" ? "Fest Organizer" : "College Admin"} of <span className="text-zinc-200 font-semibold">{adminProfile.club_profile?.club_name || "your organization"}</span>. Intelligently scaling your campus reach.
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Button onClick={() => setActiveTab("profile")} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300">
                      Edit Profile
                    </Button>
                    <Button onClick={() => navigate("/createevent")} className="bg-purple-600 hover:bg-purple-500 text-white shadow-md border-0 cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" /> Host Event
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-purple-500/20 transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Events Created</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{stats.totalEvents}</h3>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-blue-500/20 transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Registrations</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{stats.totalRegistrations}</h3>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-cyan-500/20 transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Views</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{stats.totalViews}</h3>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-emerald-500/20 transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Engagement Rate</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{stats.engagementRate}</h3>
                  </CardContent>
                </Card>
              </div>

              {/* AI Content Helper & Recent Activity Panel */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* AI Draft Creator Card */}
                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Nexus AI Copy Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Enter a topic or simple theme below, and Nexus AI will write a professional schedule, slogan, and description draft for your college event.
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Generative AI Codeathon" 
                        className={inputClasses}
                      />
                      <Button 
                        onClick={generateAIDraft}
                        disabled={generatingAi || !aiPrompt}
                        className="bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-md cursor-pointer border-0 h-10.5 px-4 rounded-lg font-medium"
                      >
                        {generatingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : "Draft"}
                      </Button>
                    </div>

                    {aiResult && (
                      <div className="mt-2 p-4 rounded-lg bg-zinc-950/60 border border-white/5 text-zinc-300 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {aiResult}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-zinc-400" />
                      Recent Activity Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 text-sm">
                    <div className="flex gap-3 items-start border-b border-white/5 pb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/25">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-zinc-200">12 new students registered for <span className="font-semibold text-zinc-100">National Symposium</span></p>
                        <p className="text-xs text-zinc-500 mt-1">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start border-b border-white/5 pb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/25">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-zinc-200">Your profile details successfully verified by college authorities</p>
                        <p className="text-xs text-zinc-500 mt-1">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/25">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-zinc-200">New event <span className="font-semibold text-zinc-100">AI Workshop 101</span> was successfully published</p>
                        <p className="text-xs text-zinc-500 mt-1">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* TAB 2: MANAGE EVENTS */}
          {activeTab === "events" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Your Listed Events</h2>
                  <p className="text-zinc-400 text-sm">Review, edit, or manage the registrants for your campus activities.</p>
                </div>
                <Button 
                  onClick={() => navigate("/createevent")}
                  className="bg-purple-600 hover:bg-purple-500 text-white shadow-md border-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" /> Host New Event
                </Button>
              </div>

              {events.length === 0 ? (
                <div className="w-full h-80 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-zinc-900/10">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-zinc-300 font-medium text-lg">No events created yet</p>
                  <p className="text-zinc-500 text-sm mt-2 max-w-sm text-center">
                    You haven't added any campus events. Create one to start driving registrations!
                  </p>
                  <Button onClick={() => navigate("/createevent")} className="mt-6 bg-purple-600 hover:bg-purple-500 text-white shadow-lg border-0 cursor-pointer">
                    Create First Event
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {events.map((event: any) => (
                    <Card key={event._id} className="bg-zinc-900/40 border-white/10 hover:border-purple-500/30 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                      
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <Badge className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/20 px-2 py-0.5 uppercase tracking-wide text-[10px]">
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-zinc-400 px-2 py-0.5 text-[10px]">
                            {event.status || "Draft"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                          {event.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pb-4 flex flex-col gap-4 text-xs">
                        <p className="text-zinc-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 text-zinc-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">{event.date ? new Date(event.date).toLocaleDateString() : (event.start_date ? new Date(event.start_date).toLocaleDateString() : "Not set")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{event.location?.city || event.location || "Virtual"}</span>
                          </div>
                        </div>

                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.tags.slice(0, 3).map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-white/5 border-white/5 text-zinc-500 text-[9px] px-1.5 py-0">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>

                      <div className="border-t border-white/5 bg-white/[0.01] p-4 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-zinc-500" />
                          <span className="font-semibold text-zinc-300">{event.current_participants || 0}</span>
                          <span className="text-zinc-500">/{event.max_attendees || event.max_participants || "∞"} registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-zinc-400 hover:text-red-400 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                    </Card>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: ORGANIZER PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Organizer Details</h2>
                <p className="text-zinc-400 text-sm">Update your administrative credentials, club details, and social channels.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6 w-full">
                
                {/* Account details */}
                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl w-full">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-purple-400" /> Administrative Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="w-full">
                      <label className={labelClasses}>Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={adminProfile.name}
                        onChange={handleProfileChange}
                        required
                        placeholder="Your full name"
                        className={inputClasses}
                      />
                    </div>
                    <div className="w-full">
                      <label className={labelClasses}>Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={adminProfile.email}
                        disabled
                        className={`${inputClasses} opacity-60 cursor-not-allowed`}
                      />
                    </div>
                    <div className="w-full">
                      <label className={labelClasses}>Contact Phone</label>
                      <div className="relative w-full">
                        <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                        <input 
                          type="tel" 
                          name="contact_phone"
                          value={adminProfile.contact_phone}
                          onChange={handleProfileChange}
                          placeholder="e.g. +919876543210"
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>
                    <div className="w-full">
                      <label className={labelClasses}>Administrative Role</label>
                      <select 
                        name="admin_role"
                        value={adminProfile.admin_role}
                        onChange={handleProfileChange}
                        className={selectClasses}
                      >
                        <option value="club_organizer">Club Organizer (Student Club)</option>
                        <option value="fest_organizer">Fest Committee Organizer</option>
                        <option value="college_admin">College Authority / Faculty Admin</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* College Admin Field */}
                {adminProfile.admin_role === "college_admin" && (
                  <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl w-full">
                    <CardHeader className="border-b border-white/5">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                        <Landmark className="w-5 h-5 text-blue-400" /> College Administration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 w-full">
                      <label className={labelClasses}>Managed College Name (Unique ID)</label>
                      <input 
                        type="text" 
                        name="managed_college_id"
                        value={adminProfile.managed_college_id}
                        onChange={handleProfileChange}
                        required
                        placeholder="e.g. Jadavpur University"
                        className={inputClasses}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Club Profile details */}
                {(adminProfile.admin_role === "club_organizer" || adminProfile.admin_role === "fest_organizer") && (
                  <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl w-full">
                    <CardHeader className="border-b border-white/5">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                        <BookOpen className="w-5 h-5 text-cyan-400" /> Club Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="w-full">
                        <label className={labelClasses}>Club / Committee Name</label>
                        <input 
                          type="text" 
                          name="club_profile.club_name"
                          value={adminProfile.club_profile.club_name}
                          onChange={handleProfileChange}
                          required
                          placeholder="e.g. Coding Club"
                          className={inputClasses}
                        />
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>Club Category</label>
                        <select 
                          name="club_profile.club_type"
                          value={adminProfile.club_profile.club_type}
                          onChange={handleProfileChange}
                          className={selectClasses}
                        >
                          <option value="technical">Technical</option>
                          <option value="cultural">Cultural</option>
                          <option value="sports">Sports</option>
                          <option value="literary">Literary</option>
                          <option value="social">Social</option>
                          <option value="entrepreneurship">Entrepreneurship</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>College Name</label>
                        <input 
                          type="text" 
                          name="club_profile.college"
                          value={adminProfile.club_profile.college}
                          onChange={handleProfileChange}
                          required
                          placeholder="e.g. Jadavpur University"
                          className={inputClasses}
                        />
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>Post Held / Designation</label>
                        <select 
                          name="club_profile.post_held"
                          value={adminProfile.club_profile.post_held}
                          onChange={handleProfileChange}
                          className={selectClasses}
                        >
                          <option value="president">President</option>
                          <option value="vice_president">Vice President</option>
                          <option value="secretary">Secretary</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="event_head">Event Head</option>
                          <option value="tech_head">Tech Head</option>
                          <option value="design_head">Design Head</option>
                          <option value="pr_head">PR Head</option>
                          <option value="member">Member</option>
                          <option value="faculty_advisor">Faculty Advisor</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {adminProfile.club_profile.post_held === "other" && (
                        <div className="md:col-span-2 w-full">
                          <label className={labelClasses}>Enter Custom Designation</label>
                          <input 
                            type="text" 
                            name="club_profile.custom_post"
                            value={adminProfile.club_profile.custom_post}
                            onChange={handleProfileChange}
                            required
                            placeholder="e.g. General Convenor"
                            className={inputClasses}
                          />
                        </div>
                      )}

                      <div className="w-full">
                        <label className={labelClasses}>Department (Optional)</label>
                        <input 
                          type="text" 
                          name="club_profile.department"
                          value={adminProfile.club_profile.department}
                          onChange={handleProfileChange}
                          placeholder="e.g. Mechanical Engineering"
                          className={inputClasses}
                        />
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>Year of Study (Optional)</label>
                        <input 
                          type="number" 
                          name="club_profile.year_of_study"
                          value={adminProfile.club_profile.year_of_study}
                          onChange={handleProfileChange}
                          placeholder="e.g. 3"
                          className={inputClasses}
                        />
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>Club Member Count (Optional)</label>
                        <input 
                          type="number" 
                          name="club_profile.member_count"
                          value={adminProfile.club_profile.member_count}
                          onChange={handleProfileChange}
                          placeholder="e.g. 50"
                          className={inputClasses}
                        />
                      </div>

                      <div className="w-full">
                        <label className={labelClasses}>Instagram URL (Optional)</label>
                        <input 
                          type="url" 
                          name="club_profile.social_instagram"
                          value={adminProfile.club_profile.social_instagram}
                          onChange={handleProfileChange}
                          placeholder="https://instagram.com/..."
                          className={inputClasses}
                        />
                      </div>

                      <div className="md:col-span-2 w-full">
                        <label className={labelClasses}>Club Description</label>
                        <textarea 
                          name="club_profile.club_description"
                          value={adminProfile.club_profile.club_description}
                          onChange={handleProfileChange}
                          placeholder="Provide a brief paragraph description of your student club..."
                          rows={3}
                          className={`${inputClasses} resize-none`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Save button */}
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("overview")}
                    className="w-1/3 h-12 bg-zinc-800/50 border-white/10 hover:bg-white/10 text-zinc-300 text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-2/3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all text-base font-semibold border-0 cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
                    ) : (
                      <><Save className="w-5 h-5 mr-2" /> Save Profile Details</>
                    )}
                  </Button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Event Analytics & Insights</h2>
                <p className="text-zinc-400 text-sm">Deep-dive into registrations growth, category metrics, and student engagement factors.</p>
              </div>

              {/* Top Row cards */}
              <div className="grid md:grid-cols-3 gap-6">
                
                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase">Growth Rate</p>
                    <h3 className="text-3xl font-extrabold text-white">+42%</h3>
                    <p className="text-[11px] text-purple-400 flex items-center gap-1 mt-1 font-medium">
                      <span>vs. last month</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <Award className="w-6 h-6 text-blue-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase">Top Category</p>
                    <h3 className="text-3xl font-extrabold text-white">Hackathons</h3>
                    <p className="text-[11px] text-blue-400 flex items-center gap-1 mt-1 font-medium">
                      <span>68% total registrations</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <Users className="w-6 h-6 text-cyan-400" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase">Peer Shares</p>
                    <h3 className="text-3xl font-extrabold text-white">418</h3>
                    <p className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-medium">
                      <span>Shared via referral codes</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Graphic simulated bars */}
              <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Student Registration Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Bar 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>1st & 2nd Year Undergrads</span>
                      <span className="text-purple-400">62 Registrations (44%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-950/60 overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: "44%" }} />
                    </div>
                  </div>

                  {/* Bar 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>3rd Year (Active Core Developers)</span>
                      <span className="text-blue-400">48 Registrations (34%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-950/60 overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: "34%" }} />
                    </div>
                  </div>

                  {/* Bar 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>4th Year (Job Seeker Seniors)</span>
                      <span className="text-cyan-400">22 Registrations (15%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-950/60 overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-cyan-600 to-teal-500 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>

                  {/* Bar 4 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Postgraduates / External Campuses</span>
                      <span className="text-emerald-400">10 Registrations (7%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-950/60 overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full" style={{ width: "7%" }} />
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
