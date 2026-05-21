
import { useState, useEffect } from "react";
import { Show, SignInButton, SignUpButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Search, Bell, ArrowRight, Zap, Bot, BarChart3, Clock, Globe, MapPin, Flame } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function HeroSection() {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country_name) {
          setLocation({ city: data.city, country: data.country_name });
        }
      })
      .catch(err => console.error("Error fetching location:", err))
      .finally(() => setLoadingLoc(false));
  }, []);

  const locationText = loadingLoc 
    ? "Locating..." 
    : (location && location.country === "India") 
      ? `${location.city}, India` 
      : location ? location.city : "India";

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Nexus AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#ai" className="hover:text-white transition-colors duration-200">AI Recommendations</a>
            <a href="#events" className="hover:text-white transition-colors duration-200">Events</a>
            <a href="#contact" className="hover:text-white transition-colors duration-200">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5">
                  Sign Up
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Navigate to="/dashboard"/>
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Column: Copy & CTAs */}
          <div className="flex flex-col gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 backdrop-blur-md px-3 py-1 hover:bg-purple-500/20 transition-colors cursor-default">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Recommendations
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md px-3 py-1 hover:bg-blue-500/20 transition-colors cursor-default">
                <Search className="w-3.5 h-3.5 mr-1.5" /> Semantic Search
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md px-3 py-1 hover:bg-emerald-500/20 transition-colors cursor-default">
                <Bell className="w-3.5 h-3.5 mr-1.5" /> Smart Notifications
              </Badge>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Discover Campus Events <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                Smarter with AI
              </span>
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              An AI-powered centralized platform helping students discover workshops, hackathons, seminars, and campus activities through personalized recommendations and semantic search.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-105 group">
                    Get Started <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="h-12 px-6 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5 group">
                    Explore Events
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-105 group">
                  Explore Events <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Show>
            </div>

            {/* Project Insights */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-white tracking-tight">50<span className="text-purple-500">+</span></p>
                <p className="text-sm text-zinc-400 font-medium">Connected Campuses</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-white tracking-tight">10k<span className="text-blue-500">+</span></p>
                <p className="text-sm text-zinc-400 font-medium">Active Students</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-white tracking-tight">5k<span className="text-cyan-500">+</span></p>
                <p className="text-sm text-zinc-400 font-medium">Events Curated</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-[800px] flex flex-col justify-center z-10 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both px-4">
            
            {/* Main Motto Card */}
            <Card className="w-full max-w-lg mx-auto bg-zinc-950/60 border-purple-500/20 backdrop-blur-xl shadow-2xl relative z-20 overflow-hidden mb-6 group hover:border-purple-500/40 transition-colors duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Why We Are Better
                </CardTitle>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  We don't just list events. We intelligently connect you with the right opportunities across colleges, using advanced AI to supercharge your campus experience and networking.
                </p>
              </CardHeader>
            </Card>

            {/* Feature Grid */}
            <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-4 relative z-20">
              
              <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-blue-500/30 transition-all duration-300 cursor-default group hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500/20">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">Intercollege Modes</h4>
                    <p className="text-xs text-zinc-500 mt-1">Connect beyond your campus borders.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-emerald-500/30 transition-all duration-300 cursor-default group hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-500/20">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">AI Chatbot</h4>
                    <p className="text-xs text-zinc-500 mt-1">24/7 intelligent event assistance.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-default group hover:-translate-y-1 shadow-lg hover:shadow-purple-500/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-500/20">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">Recommendation Engine</h4>
                    <p className="text-xs text-zinc-500 mt-1">Personalized just for your goals.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-orange-500/30 transition-all duration-300 cursor-default group hover:-translate-y-1 shadow-lg hover:shadow-orange-500/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-orange-500/20">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">Smart Reminders</h4>
                    <p className="text-xs text-zinc-500 mt-1">Never miss a deadline again.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md hover:bg-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-default group col-span-2 hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/10">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex shrink-0 items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-zinc-200">Analytics for Better</h4>
                    <p className="text-sm text-zinc-500 mt-1">Track your engagement, skill growth, and networking success over time.</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.08)_0%,rgba(255,255,255,0)_70%)] pointer-events-none z-0" />
          </div>
        </div>
      </div>

      {/* Trending Events Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Trending Events
              </h2>
              <p className="text-zinc-400 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Across <span className="text-zinc-200 font-medium">{locationText}</span></span>
              </p>
            </div>
          </div>
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 group">
              View all in your area <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </SignInButton>
        </div>

        <div className="w-full h-64 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-zinc-900/20">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <p className="text-zinc-300 font-medium text-lg">Curating your events...</p>
          <p className="text-zinc-500 text-sm mt-2 max-w-sm text-center">
            Our AI recommendation engine is analyzing trends to suggest the best events for you.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      
    </div>
  );
}