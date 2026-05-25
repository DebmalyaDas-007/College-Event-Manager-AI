import { useState, useEffect } from "react";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Search, Filter, Calendar, MapPin, Users, 
  ArrowLeft, Building, Sparkles, BookOpen, User, 
  Globe, Tag, CalendarClock, Phone, Mail, Award, CheckCircle, Info, X
} from "lucide-react";

export default function EventExplorer() {
  const { getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCollegeTab, setSelectedCollegeTab] = useState<"my_college" | "other_colleges" | "all">("my_college");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    const loadEventsData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // 1. Fetch User Profile to get their college
        const profileRes = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        let profileData = null;
        if (profileRes.ok) {
          const data = await profileRes.json();
          profileData = data.profile || data;
          setUserProfile(profileData);
        }

        // 2. Fetch all events
        const eventsRes = await fetch("http://localhost:8000/api/v1/events", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.error("Error loading event explorer data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEventsData();
  }, [getToken]);

  const handleRegister = async (eventId: string) => {
    if (registeringId) return;
    setRegisteringId(eventId);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication expired");

      const res = await fetch(`http://localhost:8000/api/v1/users/register/${eventId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Update user registered events locally
        setUserProfile((prev: any) => ({
          ...prev,
          registered_events: prev.registered_events 
            ? [...prev.registered_events, eventId] 
            : [eventId]
        }));

        // Update events current participants locally
        setEvents((prevEvents) => 
          prevEvents.map((evt) => 
            evt._id === eventId 
              ? { ...evt, current_participants: (evt.current_participants || 0) + 1 }
              : evt
          )
        );

        // Update selected event locally if it's open
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent((prev: any) => ({
            ...prev,
            current_participants: (prev.current_participants || 0) + 1
          }));
        }

        alert("Successfully registered for this event!");
      } else {
        const errText = await res.text();
        alert(`Registration failed: ${errText || "Please try again."}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`An error occurred: ${err.message}`);
    } finally {
      setRegisteringId(null);
    }
  };

  if (!userLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const myCollegeName = userProfile?.college || "Jadavpur University";

  // Filter events based on criteria
  const filteredEvents = events.filter((evt) => {
    // 1. Category Filter
    if (selectedCategory && evt.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // 2. College Tab Filter
    const eventCollege = evt.conducting_college || evt.college || "";
    const isMyCollege = eventCollege.toLowerCase().trim() === myCollegeName.toLowerCase().trim();
    if (selectedCollegeTab === "my_college" && !isMyCollege) return false;
    if (selectedCollegeTab === "other_colleges" && isMyCollege) return false;

    // 3. Search Query Filter (Matches title, description, organizing club or tags)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatches = evt.title?.toLowerCase().includes(q);
      const descMatches = evt.description?.toLowerCase().includes(q);
      const clubMatches = evt.organizing_club?.toLowerCase().includes(q);
      const tagMatches = evt.tags?.some((t: string) => t.toLowerCase().includes(q));
      if (!titleMatches && !descMatches && !clubMatches && !tagMatches) {
        return false;
      }
    }

    return true;
  });

  const isUserRegistered = (eventId: string) => {
    return userProfile?.registered_events?.includes(eventId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background glowing elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Nexus Events
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 px-3 py-1 flex items-center gap-1.5 cursor-default font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>{myCollegeName}</span>
            </Badge>
            <div className="pl-4 border-l border-white/10">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Page Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Campus Event Explorer
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
              Intelligently aggregate and register for workshops, hackathons, and activities at your college or explore what is trending globally.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-zinc-900/40 border border-white/5 px-5 py-3 rounded-xl backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Available Events</p>
              <h3 className="text-2xl font-bold text-white mt-1">{events.length}</h3>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 px-5 py-3 rounded-xl backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">My Registrations</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{userProfile?.registered_events?.length || 0}</h3>
            </div>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center bg-zinc-900/20 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, club, tags..." 
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* College location tabs */}
          <div className="lg:col-span-5 flex gap-1.5 bg-zinc-950/60 border border-white/10 p-1.5 rounded-xl">
            <button 
              onClick={() => setSelectedCollegeTab("my_college")}
              className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all border-0 cursor-pointer ${
                selectedCollegeTab === "my_college" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white bg-transparent"
              }`}
            >
              My College
            </button>
            <button 
              onClick={() => setSelectedCollegeTab("other_colleges")}
              className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all border-0 cursor-pointer ${
                selectedCollegeTab === "other_colleges" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white bg-transparent"
              }`}
            >
              Other Colleges
            </button>
            <button 
              onClick={() => setSelectedCollegeTab("all")}
              className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all border-0 cursor-pointer ${
                selectedCollegeTab === "all" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white bg-transparent"
              }`}
            >
              All Events
            </button>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3 relative">
            <Filter className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-500 pointer-events-none" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Hackathon">Hackathons</option>
              <option value="Workshop">Workshops</option>
              <option value="Seminar">Seminars</option>
              <option value="Cultural">Cultural Fests</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Dynamic Grid Results */}
        {filteredEvents.length === 0 ? (
          <div className="w-full h-80 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-zinc-900/10 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
              <CalendarClock className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-zinc-300 font-semibold text-lg">No active events found</p>
            <p className="text-zinc-500 text-sm mt-1.5 max-w-sm text-center">
              Try adjusting your search criteria, category selection, or shifting filters to "All Events".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredEvents.map((evt) => {
              const registered = isUserRegistered(evt._id);
              const eventCollege = evt.conducting_college || evt.college || "Global";
              
              return (
                <Card 
                  key={evt._id} 
                  className="bg-zinc-900/40 border-white/15 hover:border-purple-500/30 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
                  onClick={() => setSelectedEvent(evt)}
                >
                  {/* Decorative background hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Card Banner Image or default visual */}
                  <div className="h-44 w-full relative overflow-hidden bg-zinc-950">
                    {evt.image_url || (evt.image_urls && evt.image_urls.length > 0) ? (
                      <img 
                        src={evt.image_url || evt.image_urls[0]} 
                        alt={evt.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center border-b border-white/5">
                        <Sparkles className="w-10 h-10 text-purple-500/30 animate-pulse" />
                      </div>
                    )}
                    
                    {/* Floating category badge */}
                    <Badge className="absolute top-4 left-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5 border-0">
                      {evt.category || "Event"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2 pt-5">
                    <CardTitle className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                      {evt.title}
                    </CardTitle>
                    <p className="text-zinc-500 text-xs flex items-center gap-1.5 font-medium mt-1">
                      <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{eventCollege}</span>
                    </p>
                  </CardHeader>

                  <CardContent className="pb-4 flex flex-col gap-4 text-xs">
                    <p className="text-zinc-400 line-clamp-2 leading-relaxed h-8">
                      {evt.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-zinc-400 font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">
                          {evt.date ? new Date(evt.date).toLocaleDateString() : (evt.start_date ? new Date(evt.start_date).toLocaleDateString() : "TBD")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{evt.location?.city || evt.location || "Main Campus"}</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Card footer details and call to action */}
                  <div className="border-t border-white/5 bg-white/[0.01] px-5 py-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span className="font-bold text-zinc-300">{evt.current_participants || 0}</span>
                      <span className="text-zinc-500 font-medium">Registered</span>
                    </div>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid opening details modal
                        if (!registered) handleRegister(evt._id);
                      }}
                      disabled={registered || registeringId === evt._id}
                      className={`h-8 font-semibold rounded-lg px-4 border-0 cursor-pointer shadow-md ${
                        registered 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default shadow-none" 
                          : "bg-purple-600 hover:bg-purple-500 text-white"
                      }`}
                    >
                      {registeringId === evt._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : registered ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Going</span>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </main>

      {/* Premium Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Background glowing glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

            {/* Modal Image Header */}
            <div className="h-64 sm:h-72 w-full relative bg-zinc-900 border-b border-white/10">
              {selectedEvent.image_url || (selectedEvent.image_urls && selectedEvent.image_urls.length > 0) ? (
                <img 
                  src={selectedEvent.image_url || selectedEvent.image_urls[0]} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                  <Sparkles className="w-14 h-14 text-purple-500/20 animate-pulse" />
                </div>
              )}
              
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-black/60 p-2 rounded-full backdrop-blur-md border border-white/10 cursor-pointer hover:scale-105 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <Badge className="absolute bottom-4 left-6 bg-purple-600 text-white font-bold text-[11px] tracking-wider uppercase px-3 py-1 border-0">
                {selectedEvent.category || "Event"}
              </Badge>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 relative z-10">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {selectedEvent.title}
                </h3>
                <p className="text-zinc-400 text-sm flex items-center gap-1.5 mt-2 font-medium">
                  <Building className="w-4 h-4 text-purple-400 shrink-0" />
                  {selectedEvent.conducting_college || selectedEvent.college || "Global"}
                </p>
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Description</h4>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-xl backdrop-blur-md text-sm">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold font-mono uppercase">Date & Time</p>
                    <p className="text-zinc-200 font-medium">
                      {selectedEvent.date ? new Date(selectedEvent.date).toLocaleString() : (selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleString() : "TBD")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold font-mono uppercase">Location / Venue</p>
                    <p className="text-zinc-200 font-medium truncate max-w-[180px]">
                      {selectedEvent.location?.city || selectedEvent.location || "Venue TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold font-mono uppercase">Attendee Cap</p>
                    <p className="text-zinc-200 font-medium">
                      {selectedEvent.current_participants || 0} / {selectedEvent.max_attendees || selectedEvent.max_participants || "Unlimited"} registered
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold font-mono uppercase">Organizing Club</p>
                    <p className="text-zinc-200 font-medium truncate max-w-[180px]">
                      {selectedEvent.organizing_club || "Host Club"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra details fields */}
              {selectedEvent.insights && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" /> Key Insights & Learning Objectives
                  </h4>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line p-3.5 rounded-lg bg-purple-500/[0.03] border border-purple-500/10">
                    {selectedEvent.insights}
                  </p>
                </div>
              )}

              {selectedEvent.special_notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" /> Prerequisites & Special Notes
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line p-3.5 rounded-lg bg-blue-500/[0.03] border border-blue-500/10">
                    {selectedEvent.special_notes}
                  </p>
                </div>
              )}

              {/* Contact info grid */}
              {(selectedEvent.contact_email || selectedEvent.contact_phone) && (
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-zinc-500 font-medium justify-between">
                  {selectedEvent.contact_email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Contact: <span className="text-zinc-400">{selectedEvent.contact_email}</span></span>
                    </div>
                  )}
                  {selectedEvent.contact_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Phone: <span className="text-zinc-400">{selectedEvent.contact_phone}</span></span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedEvent.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-white/5 border-white/5 text-zinc-400 px-2.5 py-0.5 rounded-lg font-medium text-[10px]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Register button for modal */}
              <div className="pt-4">
                <Button 
                  onClick={() => handleRegister(selectedEvent._id)}
                  disabled={isUserRegistered(selectedEvent._id) || registeringId === selectedEvent._id}
                  className={`w-full h-12 text-lg font-medium rounded-xl border-0 cursor-pointer shadow-lg transition-all ${
                    isUserRegistered(selectedEvent._id)
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default shadow-none"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25"
                  }`}
                >
                  {registeringId === selectedEvent._id ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...</>
                  ) : isUserRegistered(selectedEvent._id) ? (
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> You are registered for this event</span>
                  ) : (
                    "Confirm Registration"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
