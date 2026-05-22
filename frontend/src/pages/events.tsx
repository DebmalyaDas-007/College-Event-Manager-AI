import { useState } from "react";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Loader2, Sparkles, MapPin, Building, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    tags: "",
    max_attendees: "",
    organizing_club: "",
    conducting_college: "",
    contact_email: "",
    contact_phone: "",
    insights: "",
    special_notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");

      let uploadedImageUrl = null;

      // 1. Upload image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const uploadRes = await fetch("http://localhost:8000/api/v1/upload/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: imageFormData
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      // 2. Format tags and numbers
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        image_url: uploadedImageUrl
      };

      // 3. Create Event
      const eventRes = await fetch("http://localhost:8000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!eventRes.ok) throw new Error("Failed to create event");
      
      alert("Event successfully created!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Error creating event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-zinc-400 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-24 pb-12 px-6 font-sans selection:bg-purple-500/30">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Host a New Event
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Fill in the details below to list your event on the Nexus AI platform and reach students across top campuses.
          </p>
        </div>

        <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-150">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" /> Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Image Upload Area */}
              <div>
                <label className={labelClasses}>Event Banner Cover</label>
                <div className="relative group w-full h-48 md:h-64 rounded-xl border-2 border-dashed border-white/10 bg-zinc-950/50 flex flex-col items-center justify-center overflow-hidden hover:border-purple-500/50 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center z-10">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                        <ImagePlus className="w-6 h-6 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">Click or drag to upload banner</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute z-10 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus className="w-4 h-4 text-white" />
                      <span className="text-sm text-white font-medium">Change Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Event Title *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., National Tech Symposium 2026" className={inputClasses} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Description *</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What is this event about?" className={`${inputClasses} resize-none`} />
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Date & Time *</label>
                  <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Venue or Virtual Link" className={`${inputClasses} pl-9`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Category *</label>
                  <select required name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                    <option value="" disabled>Select a category</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural Fest</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Max Attendees</label>
                  <input type="number" name="max_attendees" value={formData.max_attendees} onChange={handleChange} placeholder="Leave blank for unlimited" className={inputClasses} />
                </div>
              </div>

              {/* Organization Details */}
              <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                    <Building className="w-4 h-4 text-blue-400" /> Host Details
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Conducting College / University *</label>
                  <input required type="text" name="conducting_college" value={formData.conducting_college} onChange={handleChange} placeholder="e.g., MIT, IIT Delhi" className={inputClasses} />
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Organizing Club / Society</label>
                  <input type="text" name="organizing_club" value={formData.organizing_club} onChange={handleChange} placeholder="e.g., Computer Science Club" className={inputClasses} />
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Contact Email</label>
                  <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="host@example.com" className={inputClasses} />
                </div>

                <div className="space-y-1">
                  <label className={labelClasses}>Contact Phone</label>
                  <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+1 234 567 890" className={inputClasses} />
                </div>
              </div>

              {/* Extra Details */}
              <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-cyan-400" /> Additional Information
                  </h3>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Tags (Comma separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., AI, Web3, Networking, Free" className={inputClasses} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Key Insights & Objectives</label>
                  <textarea name="insights" value={formData.insights} onChange={handleChange} rows={2} placeholder="What will participants learn or achieve?" className={`${inputClasses} resize-none`} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Special Notes / Prerequisites</label>
                  <textarea name="special_notes" value={formData.special_notes} onChange={handleChange} rows={2} placeholder="Any specific requirements to attend?" className={`${inputClasses} resize-none`} />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing Event...
                    </>
                  ) : (
                    "Publish Event"
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}