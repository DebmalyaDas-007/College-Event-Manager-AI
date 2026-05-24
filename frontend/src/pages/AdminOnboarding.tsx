import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, Save, Shield, User, Phone, Landmark, BookOpen
} from "lucide-react";

export default function AdminOnboarding() {
  const { getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [adminRole, setAdminRole] = useState("club_organizer");

  // Form states matching AdminCreate
  const [formData, setFormData] = useState({
    contact_phone: "",
    managed_college_id: "",
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(false);
    try {
      const token = await getToken();
      if (!token) {
        alert("Authentication token expired. Please sign in again.");
        return;
      }

      setLoading(true);

      // Base admin properties
      const payload: any = {
        clerk_id: user.id,
        name: user.fullName || "New Admin",
        email: user.primaryEmailAddress?.emailAddress || "",
        contact_phone: formData.contact_phone || null,
        admin_role: adminRole,
        managed_college_id: adminRole === "college_admin" ? formData.managed_college_id : null,
      };

      // Add club profile details if role matches
      if (adminRole === "club_organizer" || adminRole === "fest_organizer") {
        payload.club_profile = {
          club_name: formData.club_name,
          club_type: formData.club_type,
          post_held: formData.post_held,
          custom_post: formData.post_held === "other" ? formData.custom_post : null,
          college: formData.college,
          department: formData.department || null,
          year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
          club_description: formData.club_description || null,
          social_links: {
            instagram: formData.social_instagram || "",
            linkedin: formData.social_linkedin || ""
          },
          member_count: formData.member_count ? parseInt(formData.member_count) : null
        };
      }

      const res = await fetch("http://localhost:8000/api/v1/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Admin profile registered successfully!");
        navigate("/dashboard");
      } else {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        alert(`Registration failed.\nStatus: ${res.status}\nDetails: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Error submitting admin profile", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const selectClasses = "w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-zinc-400 mb-2 ml-1";

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background glowing orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="pt-16 pb-16 px-4 sm:px-6 relative z-10 w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Admin & Organizer Setup
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto">
            Provide the required details to initialize your administrator or campus organizer profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Section 1: General Info */}
          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-purple-400" /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="w-full">
                <label className={labelClasses}>Full Name</label>
                <input 
                  type="text" 
                  value={user?.fullName || ""} 
                  disabled 
                  className={`${inputClasses} bg-zinc-950/40 opacity-70 cursor-not-allowed`} 
                />
              </div>

              <div className="w-full">
                <label className={labelClasses}>Email Address</label>
                <input 
                  type="email" 
                  value={user?.primaryEmailAddress?.emailAddress || ""} 
                  disabled 
                  className={`${inputClasses} bg-zinc-950/40 opacity-70 cursor-not-allowed`} 
                />
              </div>

              <div className="w-full">
                <label className={labelClasses}>Contact Phone Number</label>
                <div className="relative w-full">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                  <input 
                    type="tel" 
                    name="contact_phone" 
                    value={formData.contact_phone} 
                    onChange={handleChange} 
                    placeholder="e.g. +919876543210" 
                    className={`${inputClasses} pl-10`} 
                  />
                </div>
              </div>

              <div className="w-full">
                <label className={labelClasses}>Administrative Role</label>
                <div className="relative w-full">
                  <Shield className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <select 
                    name="admin_role" 
                    value={adminRole} 
                    onChange={(e) => setAdminRole(e.target.value)} 
                    className={`${selectClasses} pl-10`}
                  >
                    <option value="club_organizer">Club Organizer (Student Club)</option>
                    <option value="fest_organizer">Fest Committee Organizer</option>
                    <option value="college_admin">College Authority / Faculty Admin</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: College Admin Specific Field */}
          {adminRole === "college_admin" && (
            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <Landmark className="w-5 h-5 text-blue-400" /> College Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 w-full">
                <label className={labelClasses}>Managed College Name (Unique ID)</label>
                <input 
                  type="text" 
                  name="managed_college_id" 
                  value={formData.managed_college_id} 
                  onChange={handleChange} 
                  required
                  placeholder="e.g. Jadavpur University" 
                  className={inputClasses} 
                />
              </CardContent>
            </Card>
          )}

          {/* Section 3: Club Profile (Mandatory for club & fest organizers) */}
          {(adminRole === "club_organizer" || adminRole === "fest_organizer") && (
            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden w-full">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-cyan-400" /> Club & Organizer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="w-full">
                  <label className={labelClasses}>Club / Committee Name</label>
                  <input 
                    type="text" 
                    name="club_name" 
                    value={formData.club_name} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Coding Club, Music Society" 
                    className={inputClasses} 
                  />
                </div>

                <div className="w-full">
                  <label className={labelClasses}>Club Category</label>
                  <select 
                    name="club_type" 
                    value={formData.club_type} 
                    onChange={handleChange} 
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
                    name="college" 
                    value={formData.college} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Jadavpur University" 
                    className={inputClasses} 
                  />
                </div>

                <div className="w-full">
                  <label className={labelClasses}>Post Held / Designation</label>
                  <select 
                    name="post_held" 
                    value={formData.post_held} 
                    onChange={handleChange} 
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

                {formData.post_held === "other" && (
                  <div className="md:col-span-2 w-full">
                    <label className={labelClasses}>Enter Custom Designation</label>
                    <input 
                      type="text" 
                      name="custom_post" 
                      value={formData.custom_post} 
                      onChange={handleChange} 
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
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    placeholder="e.g. Mechanical Engineering" 
                    className={inputClasses} 
                  />
                </div>

                <div className="w-full">
                  <label className={labelClasses}>Year of Study (Optional)</label>
                  <input 
                    type="number" 
                    name="year_of_study" 
                    min="1" 
                    max="6" 
                    value={formData.year_of_study} 
                    onChange={handleChange} 
                    placeholder="e.g. 3" 
                    className={inputClasses} 
                  />
                </div>

                <div className="w-full">
                  <label className={labelClasses}>Club Member Count (Optional)</label>
                  <input 
                    type="number" 
                    name="member_count" 
                    min="1" 
                    value={formData.member_count} 
                    onChange={handleChange} 
                    placeholder="e.g. 50" 
                    className={inputClasses} 
                  />
                </div>

                <div className="w-full">
                  <label className={labelClasses}>Instagram URL (Optional)</label>
                  <input 
                    type="url" 
                    name="social_instagram" 
                    value={formData.social_instagram} 
                    onChange={handleChange} 
                    placeholder="https://instagram.com/..." 
                    className={inputClasses} 
                  />
                </div>

                <div className="md:col-span-2 w-full">
                  <label className={labelClasses}>Club Description</label>
                  <textarea 
                    name="club_description" 
                    value={formData.club_description} 
                    onChange={handleChange} 
                    placeholder="Provide a brief paragraph description of your student club or fest committee..." 
                    rows={3}
                    className={`${inputClasses} resize-none`} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <Card className="bg-zinc-900/80 border-purple-500/30 backdrop-blur-xl shadow-2xl overflow-hidden w-full mt-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/onboarding")}
                className="w-full sm:w-1/3 h-12 bg-zinc-800/50 border-white/10 hover:bg-white/10 text-zinc-300 text-lg"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-2/3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all text-lg font-medium border-0 cursor-pointer"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Admin...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Save Admin Profile</>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
