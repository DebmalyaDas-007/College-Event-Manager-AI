import { useState, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Loader2, Save, Sparkles, GraduationCap, Link, Briefcase, Wrench, Search, Bell, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [profileData, setProfileData] = useState({
    college: "",
    department: "",
    cgpa: "",
    address: "",
    tenth_percentage: "",
    twelfth_percentage: "",
    interests: "",
    hobbies: "",
    skills: "",
    github_url: "",
    linkedin_url: ""
  });

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
          const profile = data.profile || data;
          if (profile) {
            setProfileData({
              college: profile.college === "Not Specified" ? "" : (profile.college || ""),
              department: profile.department || "",
              cgpa: profile.cgpa ? profile.cgpa.toString() : "",
              address: profile.address || "",
              tenth_percentage: profile.tenth_percentage ? profile.tenth_percentage.toString() : "",
              twelfth_percentage: profile.twelfth_percentage ? profile.twelfth_percentage.toString() : "",
              interests: profile.interests ? profile.interests.join(", ") : "",
              hobbies: profile.hobbies ? profile.hobbies.join(", ") : "",
              skills: profile.skills ? profile.skills.join(", ") : "",
              github_url: profile.github_url || "",
              linkedin_url: profile.linkedin_url || ""
            });
          }
        }
      } catch (e) {
        console.error("Error fetching profile", e);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      
      const payload = {
        college: profileData.college,
        department: profileData.department,
        cgpa: profileData.cgpa ? parseFloat(profileData.cgpa) : null,
        address: profileData.address,
        tenth_percentage: profileData.tenth_percentage ? parseFloat(profileData.tenth_percentage) : null,
        twelfth_percentage: profileData.twelfth_percentage ? parseFloat(profileData.twelfth_percentage) : null,
        interests: profileData.interests.split(",").map(i => i.trim()).filter(i => i),
        hobbies: profileData.hobbies.split(",").map(i => i.trim()).filter(i => i),
        skills: profileData.skills.split(",").map(i => i.trim()).filter(i => i),
        github_url: profileData.github_url,
        linkedin_url: profileData.linkedin_url,
        is_profile_complete: true
      };

      const res = await fetch("http://localhost:8000/api/v1/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/dashboard");
      } else {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        alert(`Failed to update profile.\nStatus: ${res.status}\nDetails: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Error updating profile", error);
      alert(`An error occurred while saving: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-zinc-400 mb-2 ml-1";

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors mr-2" />
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
            <div className="pl-4 border-l border-white/10">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="pt-24 pb-16 px-4 sm:px-6 relative z-10 w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Your Profile
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto">
            Complete your profile to unlock personalized event recommendations and connect with peers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          
          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <GraduationCap className="w-5 h-5 text-blue-400" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="md:col-span-2 w-full">
                <label className={labelClasses}>College / University</label>
                <input type="text" name="college" value={profileData.college} onChange={handleChange} placeholder="e.g. MIT, Stanford" className={inputClasses} />
              </div>
              
              <div className="w-full">
                <label className={labelClasses}>Department / Major</label>
                <input type="text" name="department" value={profileData.department} onChange={handleChange} placeholder="e.g. Computer Science" className={inputClasses} />
              </div>
              
              <div className="w-full">
                <label className={labelClasses}>Current CGPA</label>
                <input type="number" step="0.01" max="10" name="cgpa" value={profileData.cgpa} onChange={handleChange} placeholder="e.g. 8.5" className={inputClasses} />
              </div>

              <div className="w-full">
                <label className={labelClasses}>10th Percentage (%)</label>
                <input type="number" step="0.01" max="100" name="tenth_percentage" value={profileData.tenth_percentage} onChange={handleChange} placeholder="e.g. 95.5" className={inputClasses} />
              </div>

              <div className="w-full">
                <label className={labelClasses}>12th Percentage (%)</label>
                <input type="number" step="0.01" max="100" name="twelfth_percentage" value={profileData.twelfth_percentage} onChange={handleChange} placeholder="e.g. 92.0" className={inputClasses} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-purple-400" /> Personal & Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="md:col-span-2 w-full">
                <label className={labelClasses}>Current Address</label>
                <div className="relative w-full">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                  <textarea 
                    name="address" 
                    value={profileData.address} 
                    onChange={handleChange} 
                    placeholder="Enter your complete residential address" 
                    rows={2}
                    className={`${inputClasses} pl-10 resize-none`} 
                  />
                </div>
              </div>

              <div className="w-full">
                <label className={labelClasses}>GitHub Profile URL</label>
                <div className="relative w-full">
                  <Link className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                  <input type="url" name="github_url" value={profileData.github_url} onChange={handleChange} placeholder="https://github.com/..." className={`${inputClasses} pl-10`} />
                </div>
              </div>

              <div className="w-full">
                <label className={labelClasses}>LinkedIn Profile URL</label>
                <div className="relative w-full">
                  <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                  <input type="url" name="linkedin_url" value={profileData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/..." className={`${inputClasses} pl-10`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-cyan-400" /> Interests, Skills & Hobbies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 gap-6 w-full">
              <div className="w-full">
                <label className={labelClasses}>Professional Interests (comma separated)</label>
                <input type="text" name="interests" value={profileData.interests} onChange={handleChange} placeholder="e.g. AI, Web3, Hackathons, Robotics" className={inputClasses} />
              </div>

              <div className="w-full">
                <label className={labelClasses}>Technical / Core Skills (comma separated)</label>
                <div className="relative w-full">
                  <Wrench className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                  <input type="text" name="skills" value={profileData.skills} onChange={handleChange} placeholder="e.g. React, Python, Machine Learning" className={`${inputClasses} pl-10`} />
                </div>
              </div>
              
              <div className="w-full">
                <label className={labelClasses}>Personal Hobbies (comma separated)</label>
                <input type="text" name="hobbies" value={profileData.hobbies} onChange={handleChange} placeholder="e.g. Reading, Traveling, Chess" className={inputClasses} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-purple-500/30 backdrop-blur-xl shadow-2xl overflow-hidden w-full mt-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-1/3 h-12 bg-zinc-800/50 border-white/10 hover:bg-white/10 text-zinc-300 text-lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-2/3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all text-lg font-medium border-0"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Save Profile Details</>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
